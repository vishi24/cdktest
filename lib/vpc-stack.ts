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

export class vpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AwsEnvStackProps) {
    //   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const { config } = props;
    const cidr = config.CIDR;

    const vpc = new ec2.Vpc(this, "sbrc", {
      maxAzs: 2, // Use 2 Availability Zones
      //   cidr: "10.40.0.0/16", //configurable-parameterized
      cidr: cidr,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24, //can be configurable
          name: "public-",
          subnetType: ec2.SubnetType.PUBLIC,
        },

        {
          cidrMask: 24, //can be configurable
          name: "app-pvt-",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },

        {
          cidrMask: 24, //can be configurable
          name: "db-pvt-",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],

      gatewayEndpoints: {
        S3: {
          service: GatewayVpcEndpointAwsService.S3,
        },
      },
    });

    new cdk.CfnOutput(this, "ExportedVpcId", {
      value: vpc.vpcId,
      exportName: "SB-RCVPC", // This is the name by which it will be imported
    });
  }
}
