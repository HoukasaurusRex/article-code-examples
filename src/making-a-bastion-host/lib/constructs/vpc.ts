import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import { addTags, CfnLogger } from '../utils'

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
  
    // // the following settings will allow ssm to access instances in isolated subnets
    const vpcEndpointSecurityGroup = new ec2.SecurityGroup(scope, `${prefix}-vpc-endpoints-outbound-sg`,{ 
      allowAllOutbound: true, 
      vpc, 
      securityGroupName: `${prefix}-vpc-endpoints-outbound-sg`,
      description: 'Allows resources inside isolated VPC access to defined vpc gateway and interface endpoints'
    })
  
    // addTags(new ec2.GatewayVpcEndpoint(scope, `${prefix}-s3-endpoint`, {
    //   vpc,
    //   service: ec2.GatewayVpcEndpointAwsService.S3,
    //   subnets: [{ subnetType: ec2.SubnetType.ISOLATED }]
    // }),{ 
    //   Name: `${prefix}-s3-endpoint`
    // })
  
    // addTags(new ec2.InterfaceVpcEndpoint(scope, `${prefix}-cloudwatch-endpoint`, {
    //   vpc,
    //   open: true,
    //   privateDnsEnabled: true,
    //   service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH,
    //   subnets: vpc.selectSubnets(),
    //   securityGroups: [vpcEndpointSecurityGroup],
    // }),{ 
    //   Name: `${prefix}-cloudwatch-endpoint`
    // })

    // addTags(new ec2.InterfaceVpcEndpoint(scope, `${prefix}-cloudwatch-logs-endpoint`, {
    //   vpc,
    //   open: true,
    //   privateDnsEnabled: true,
    //   service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
    //   subnets: vpc.selectSubnets(),
    //   securityGroups: [vpcEndpointSecurityGroup],
    // }),{ 
    //   Name: `${prefix}-cloudwatch-logs-endpoint`
    // })

    // addTags(new ec2.InterfaceVpcEndpoint(scope, `${prefix}-ssm-messages-endpoint`, {
    //   vpc,
    //   open: true,
    //   privateDnsEnabled: true,
    //   service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
    //   subnets: vpc.selectSubnets(),
    //   securityGroups: [vpcEndpointSecurityGroup],
    // }),{ 
    //   Name: `${prefix}-ssm-messages-endpoint`
    // })

    // addTags(new ec2.InterfaceVpcEndpoint(scope, `${prefix}-ec2-endpoint`, {
    //   vpc,
    //   open: true,
    //   privateDnsEnabled: true,
    //   service: ec2.InterfaceVpcEndpointAwsService.EC2,
    //   subnets: vpc.selectSubnets(),
    //   securityGroups: [vpcEndpointSecurityGroup],
    // }),{ 
    //   Name: `${prefix}-ec2-endpoint`
    // })
  
    // addTags(new ec2.InterfaceVpcEndpoint(scope, `${prefix}-ec2-messages-endpoint`, {
    //   vpc,
    //   open: true,
    //   privateDnsEnabled: true,
    //   service: ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
    //   subnets: vpc.selectSubnets(),
    //   securityGroups: [vpcEndpointSecurityGroup],
    // }),{ 
    //   Name: `${prefix}-ec2-messages-endpoint`
    // })
  
    // addTags(new ec2.InterfaceVpcEndpoint(scope, `${prefix}-ssm-endpoint`, {
    //   vpc,
    //   open: true,
    //   privateDnsEnabled: true,
    //   service: ec2.InterfaceVpcEndpointAwsService.SSM,
    //   subnets: vpc.selectSubnets(),
    //   securityGroups: [vpcEndpointSecurityGroup],
    // }),{ 
    //   Name: `${prefix}-ssm-endpoint`
    // })
  
    // addTags(new ec2.InterfaceVpcEndpoint(scope, `${prefix}-secrets-manager-endpoint`, {
    //   vpc,
    //   open: true,
    //   privateDnsEnabled: true,
    //   service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
    //   subnets: vpc.selectSubnets(),
    //   securityGroups: [vpcEndpointSecurityGroup],
    // }),{ 
    //   Name: `${prefix}-secrets-manager-endpoint`
    // })

    logger.log('VPCEndpointsOutboundSGID', vpcEndpointSecurityGroup.securityGroupId)
    logger.log('VPCIsolatedSubnets', vpc.isolatedSubnets.map(subnet => subnet.subnetId).join('; '))

    this.vpc = vpc
    this.sg = vpcEndpointSecurityGroup
  }
}
