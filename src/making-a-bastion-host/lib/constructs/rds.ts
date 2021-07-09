import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as rds from '@aws-cdk/aws-rds'
import * as secrets from '@aws-cdk/aws-secretsmanager'
import * as ssm from '@aws-cdk/aws-ssm'
import { camelize, CfnLogger } from '../utils'
import { config } from '../config'

interface StackProps {
  prefix: string
  vpc: ec2.Vpc
  user: string
  port: number
  database: string
  secretName: string
}

interface PgConnInfo {
  secretName: string
  endpointAddress: string
  port: string
}

export class PostgresRdsInstance {
  public readonly pgConnInfo: PgConnInfo

  constructor(scope: cdk.Construct, props: StackProps){
    const { prefix, secretName, vpc, port, user } = props
    const logger = new CfnLogger(scope)

    const securityGroup = new ec2.SecurityGroup(scope, `${prefix}-rds`, { 
      vpc,
      securityGroupName: `${prefix}-rds-sg`,
    })

    securityGroup.addIngressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(port),
      'Allows only local resources inside VPC to access this port 5432 (Postgres)'
    )

    const databaseCredentialsSecret = new secrets.Secret(scope, camelize(`${prefix}PgdbCredentialsSecret`), {
      secretName,
      description: 'Credentials to access Postgres Database on RDS',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: user.replace(/[^a-z0-9]/gi, '_').toLowerCase() }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
      }
    })

    const databaseCredentialsARN = new ssm.StringParameter(scope, camelize(`${prefix}DBCredentialsArn`), {
      parameterName: `${prefix}-rds-credentials-arn`,
      stringValue: databaseCredentialsSecret.secretArn,
    })

    const database = new rds.DatabaseInstance(scope, camelize(`${prefix}Database`), {
      credentials: rds.Credentials.fromSecret(databaseCredentialsSecret),
      autoMinorVersionUpgrade: true,
      allowMajorVersionUpgrade: true,
      databaseName: config.aws.rds.databaseName,
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_13
      }),
      port,
      allocatedStorage: 10,
      storageType: rds.StorageType.GP2,
      backupRetention: cdk.Duration.days(7),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.ISOLATED },
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
      deletionProtection: config.stage === 'production',
      securityGroups: [securityGroup],
    })
    
    logger.log('DatabaseEndpoint', `${database.dbInstanceEndpointAddress}:${database.dbInstanceEndpointPort}`)
    logger.log('DatabaseCredentialsARN', databaseCredentialsARN.stringValue)

    this.pgConnInfo = {
      secretName: secretName,
      endpointAddress: database.dbInstanceEndpointAddress,
      port: database.dbInstanceEndpointPort
    }
  }
}
