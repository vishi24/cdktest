import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import * as rds from "aws-cdk-lib/aws-rds";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as kms from "aws-cdk-lib/aws-kms";
import { ConfigProps } from "./config";
import { Stack, StackProps } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as eksconnect from "aws-cdk-lib/aws-eks";

import {
  GatewayVpcEndpointAwsService,
  Vpc,
  FlowLogTrafficType,
  FlowLogDestination,
  InterfaceVpcEndpoint,
} from "aws-cdk-lib/aws-ec2";

import { SubnetGroup } from "aws-cdk-lib/aws-rds";
type AwsEnvStackProps = StackProps & {
  config: Readonly<ConfigProps>;
};

// import * as sqs from 'aws-cdk-lib/aws-sqs';
export class sbrcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AwsEnvStackProps) {
    //   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const vpcId = cdk.Fn.importValue("SB-RCVPC");
    const { config } = props;

    //---------------Security Group Creation Start-------------------------------

    // Create a Security Group - EKS
    const securityGroupEKS = new ec2.SecurityGroup(this, "EKSSecurityGroup", {
      vpc: ec2.Vpc.fromLookup(this, "vpc", { vpcId }),
      allowAllOutbound: true,
      description: "Security group for RDS-Aurora Postgres",
    });

    // Add inbound rules to the security group - Needs to be checked

    securityGroupEKS.addIngressRule(
      ec2.Peer.ipv4("10.40.0.0/16"), //make configurable
      ec2.Port.allTraffic(),
      "Allow RDS traffic"
    );

    //---------------Security Group Creation End-------------------------------
    const iamRole = iam.Role.fromRoleArn(
      this,
      "MyIAMRole",
      "arn:aws:iam::370803901956:role/AWSReservedSSO_AWSAdministratorAccess_2961c11892dc6700"
    );

    const eksCluster = new eks.FargateCluster(this, "MyCluster", {
      vpc: ec2.Vpc.fromLookup(this, "vpc", { vpcId }),
      vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }],
      version: eks.KubernetesVersion.V1_27,
      securityGroup: securityGroupEKS,
      endpointAccess: eks.EndpointAccess.PUBLIC_AND_PRIVATE,
      clusterName: "eks-sbrc-new-v2",
      mastersRole: iamRole, //Config
      outputClusterName: true,
      outputConfigCommand: true,
      // serviceIpv4Cidr: "10.60.0.0/16",
      albController: {
        version: eks.AlbControllerVersion.V2_5_1,
      },
    });

    const fargateProfile = eksCluster.addFargateProfile("MyFargateProfile", {
      selectors: [
        //{ namespace: 'kube-system' }, // Add selectors for namespaces
        { namespace: "sbrc-registry" },
      ],
    });

    const awsAuth = new eks.AwsAuth(this, "MyAwsAuth", {
      cluster: eksCluster,
    });
  }
}
