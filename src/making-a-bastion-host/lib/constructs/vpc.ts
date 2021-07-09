import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import { CfnLogger } from '../utils'

interface StackProps {
  prefix: string
  cidr: string
}

export class CustomVPC {
  public readonly vpc: ec2.Vpc
  public readonly sg: ec2.SecurityGroup

  constructor(scope: cdk.Construct, props: StackProps) {
    const { prefix, cidr } = props
    const logger = new CfnLogger(scope)
    const vpc = new ec2.Vpc(scope, `${prefix}-vpc`, {
      maxAzs: 2, // rds requires at least 2
      cidr,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 22,
          name: `${prefix}-public-`,
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 22,
          name: `${prefix}-isolated-`,
          subnetType: ec2.SubnetType.ISOLATED,
        },
      ],
    })
  
    const vpcEndpointSecurityGroup = new ec2.SecurityGroup(scope, `${prefix}-vpc-endpoints-outbound-sg`,{ 
      allowAllOutbound: true, 
      vpc, 
      securityGroupName: `${prefix}-vpc-endpoints-outbound-sg`,
      description: 'Allows resources inside isolated VPC access to defined vpc gateway and interface endpoints'
    })
  
    logger.log('VPCEndpointsOutboundSGID', vpcEndpointSecurityGroup.securityGroupId)
    logger.log('VPCIsolatedSubnets', vpc.isolatedSubnets.map(subnet => subnet.subnetId).join('; '))

    this.vpc = vpc
    this.sg = vpcEndpointSecurityGroup
  }
}
