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

// import * as sqs from 'aws-cdk-lib/aws-sqs';
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

    // // Create an IAM role
    // const role = new iam.Role(this, "s3role", {
    //   // assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    //   roleName: "sbrcs3Role", // Replace with your desired role name
    // });

    // Attach a managed policy to the role
    // role.addManagedPolicy(
    //   iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")
    // );

    // // Output the role ARN
    // const roleArnOutput = new cdk.CfnOutput(this, "RoleArn", {
    //   description: "IAM Role ARN",
    //   value: role.roleArn,
    //   exportName: `${cdk.Aws.STACK_NAME}-RoleArn`,
    // });

    // // Attach the role to the user

    // user.addToPolicy(
    //   new iam.PolicyStatement({
    //     actions: ["sts:AssumeRole"],
    //     resources: [role.roleArn],
    //   })
    // );

    const myBucket = new s3.Bucket(this, "MyBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Only for demo purposes; change to the appropriate removal policy
      bucketName: "sbrc-registry-18",
    });

    // Define an IAM policy statement that allows PutObject
    const putStatement = new iam.PolicyStatement({
      actions: ["s3:PutObject"],
      resources: [`${myBucket.bucketArn}/*`],
    });

    // Define an IAM policy statement that denies DeleteObject
    const denyDeleteStatement = new iam.PolicyStatement({
      actions: ["s3:DeleteObject"],
      resources: [`${myBucket.bucketArn}/*`],
      effect: iam.Effect.DENY,
    });

    // Create an IAM policy with both statements
    const bucketPolicy = new iam.Policy(this, "BucketPolicy", {
      statements: [putStatement, denyDeleteStatement],
    });

    // Attach the policy to the S3 bucket
    myBucket.grantReadWrite(bucketPolicy);
  }
}
