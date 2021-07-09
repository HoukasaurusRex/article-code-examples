import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import { CfnLogger } from '../utils'

interface BastionStackProps { 
  prefix: string
  vpc: ec2.Vpc
  vpcEndpointsSecurityGroup: ec2.SecurityGroup
  // Defaults to 5432
  endpointPort?: number
  endpointAddress?: string
  keyName?: string
}
export class BastionInstance {
  public readonly instance: ec2.Instance

  constructor(scope: cdk.Construct, props: BastionStackProps) {
    const { vpc, prefix, vpcEndpointsSecurityGroup, endpointAddress, keyName } = props
    const endpointPort = ec2.Port.tcp(props.endpointPort || 5432)
    const logger = new CfnLogger(scope)

    const securityGroup = new ec2.SecurityGroup(scope, `${prefix}-bastion-sg`, {
      vpc,
      allowAllOutbound: false,
      securityGroupName: `${prefix}-bastion-sg`
    })

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow ssh access from the world')
    securityGroup.addEgressRule(vpcEndpointsSecurityGroup, endpointPort, 'allow outbound connection to protected resource')
    
    const bastionInstance = new ec2.Instance(scope, `${prefix}-bastion`, {
      machineImage: ec2.MachineImage.latestAmazonLinux(),
      instanceName: `${prefix}-bastion`,
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      allowAllOutbound: false,
      keyName,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      )
    })
      
    bastionInstance.addSecurityGroup(securityGroup)

    logger.log('BastionInstancePublicDNS', `${bastionInstance.instancePublicDnsName}`)

    this.instance = bastionInstance

  }
}
