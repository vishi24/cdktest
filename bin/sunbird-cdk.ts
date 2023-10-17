#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { sbrcStack } from "../lib/sbrc-stack";
import { vpcStack } from "../lib/vpc-stack";
import { rdsStack } from "../lib/rds-stack";
import { eksStack } from "../lib/eks-stack";
import { getConfig } from "../lib/config";
import { ConfigProps } from "../lib/config";
import { Stack, StackProps } from "aws-cdk-lib";
import { s3Stack } from "../lib/s3-stack";

const config = getConfig();

// const app = new cdk.App();
// //new sbrcStack(app, "sbrcStack", config);
// new sbrcStack(app, "sbrcStack");
// env: { account: '370803901956', region: 'ap-south-1' },
const app = new cdk.App();
type AwsEnvStackProps = StackProps & {
  config: Readonly<ConfigProps>;
};
const MY_AWS_ENV_STACK_PROPS: AwsEnvStackProps = {
  // Define properties here, for example:
  env: {
    region: "ap-south-1",
    account: "370803901956",
  },
  config: config,
};

//new sbrcStack(app, "sbrcStack");
//const { configs } = config;

new vpcStack(app, "vpcstack", MY_AWS_ENV_STACK_PROPS);
new rdsStack(app, "rdsstack", MY_AWS_ENV_STACK_PROPS);
new eksStack(app, "eksstack", MY_AWS_ENV_STACK_PROPS);
new s3Stack(app, "s3stack", MY_AWS_ENV_STACK_PROPS);
