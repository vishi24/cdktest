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

const config = getConfig();

// const app = new cdk.App();
// //new sbrcStack(app, "sbrcStack", config);
// new sbrcStack(app, "sbrcStack");
// env: { account: '370803901956', region: 'ap-south-1' },
const app = new cdk.App();

type AwsEnvStackProps = StackProps & {
  config: Readonly<ConfigProps>;
};

//new sbrcStack(app, "sbrcStack");
//const { configs } = config;

new vpcStack(app, "vpc-stack", config);
new rdsStack(app, "rds-stack", configs);
new eksStack(app, "eks-stack", configs);
