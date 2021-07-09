import * as cdk from '@aws-cdk/core'
import { config } from './config'
import { CustomVPC } from './constructs/vpc'
import { BastionInstance } from './constructs/ec2'
import { PostgresRdsInstance } from './constructs/rds'

export class BastionProjectStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)
    const prefix = config.projectName

    const { vpc, sg: vpcEndpointsSecurityGroup } = new CustomVPC(this, {
      prefix,
      cidr: '172.22.0.0/16',
    })

    const { pgConnInfo } = new PostgresRdsInstance(this, {
      prefix,
      vpc,
      user: config.aws.rds.username,
      database: `${config.projectName}_${process.env.NODE_ENV || 'development'}`,
      port: 5432,
      secretName: `${config.projectName}/rds/postgres/credentials`, // secrets manager
    })
    
    new BastionInstance(this, {
      prefix: prefix + '-pg',
      vpc,
      vpcEndpointsSecurityGroup,
      endpointPort: parseInt(pgConnInfo.port, 10),
      endpointAddress: pgConnInfo.endpointAddress,
      // Cannot create keyPair with current version of CDK (1.111.0)
      // Currently requires manual creation then updating name in config.ts
      // See CDK issue for updates: https://github.com/aws/aws-cdk/issues/5252
      keyName: config.aws.ec2.sshKeyPair.pgBastion
    })
  }
}
