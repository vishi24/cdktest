import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as s3 from "aws-cdk-lib/aws-s3";
import { ConfigProps } from "./config";
import { Stack, StackProps } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ssm from "aws-cdk-lib/aws-ssm";

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

export class s3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AwsEnvStackProps) {
    super(scope, id, props);
    //const vpcId = cdk.Fn.importValue("SB-RCVPC");
    const { config } = props;

    // const vpcId = ssm.StringParameter.valueFromLookup(
    //   this,
    //   "/VpcProvider/VPCID"
    // );
    const vpc = ec2.Vpc.fromLookup(this, "SB-RCVPC", {
      vpcId: "vpc-09c0c359d8d0537c7",
    });

    // Create an IAM user
    const user = new iam.User(this, "MyUser", {
      userName: "sbrc-minio", // Replace with your desired username
    });
    user.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")
    );
    // Create an IAM access key for the user
    const accessKey = new iam.CfnAccessKey(this, "MyAccessKey", {
      userName: user.userName,
    });

    new cdk.CfnOutput(this, "AccessKey", {
      value: accessKey.attrSecretAccessKey,
    });
    new cdk.CfnOutput(this, "AccessKeyId", {
      value: accessKey.ref,
    });

    // Output the User ARN
    const userArnOutput = new cdk.CfnOutput(this, "UserArn", {
      description: "IAM User ARN",
      value: user.userArn,
      exportName: `${cdk.Aws.STACK_NAME}-UserArn`,
    });

    const myBucket = new s3.Bucket(this, "MyBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      bucketName: "sbrc-registry-18",
    });

    const putStatement = new iam.PolicyStatement({
      actions: ["s3:PutObject"],
      resources: [`${myBucket.bucketArn}/*`],
    });

    const denyDeleteStatement = new iam.PolicyStatement({
      actions: ["s3:DeleteObject"],
      resources: [`${myBucket.bucketArn}/*`],
      effect: iam.Effect.DENY,
    });

    const bucketPolicy = new iam.Policy(this, "BucketPolicy", {
      statements: [putStatement, denyDeleteStatement],
    });

    myBucket.grantReadWrite(bucketPolicy);
  }
}
