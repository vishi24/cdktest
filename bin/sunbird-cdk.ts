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
import { helmStack } from "../lib/helm-stack";

const config = getConfig();

const app = new cdk.App();
type AwsEnvStackProps = StackProps & {
  config: ConfigProps;
};
type AwsEnvStackPropseks = StackProps & {
  config: ConfigProps;
  vpc: vpcStack;
};
const MY_AWS_ENV_STACK_PROPS: AwsEnvStackProps = {
  env: {
    region: "ap-south-1",
    account: "370803901956",
  },
  config: config,
};

let infra = new vpcStack(app, "vpcstack", MY_AWS_ENV_STACK_PROPS);
new rdsStack(app, "rdsstack", MY_AWS_ENV_STACK_PROPS);
// new eksStack(app, "eksstack", MY_AWS_ENV_STACK_PROPS);
new s3Stack(app, "s3stack", MY_AWS_ENV_STACK_PROPS);
new helmStack(app, "helmStack", MY_AWS_ENV_STACK_PROPS);

const MY_AWS_ENV_STACK_PROPS_EKS: AwsEnvStackProps = {
  env: {
    region: "ap-south-1",
    account: "370803901956",
  },
  config: config,
  vpc: null,
};
new eksStack(app, "eksstack", MY_AWS_ENV_STACK_PROPS);
