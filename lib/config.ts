import * as dotenv from "dotenv";
import path = require("path");
import { vpcStack } from "./vpc-stack";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export type ConfigProps = {
  REGION: string;
  ACCOUNT: string;
  CIDR: string;
  RDS_SEC_GRP_INGRESS: string;
  MAX_AZS: number;
};

export const getConfig = (): ConfigProps => ({
  REGION: process.env.REGION || "ap-south-1",
  ACCOUNT: process.env.ACCOUNT || "370803901956",
  CIDR: process.env.CIDR || "10.40.0.0/16",
  RDS_SEC_GRP_INGRESS: process.env.RDS_SEC_GRP_INGRESS || "10.40.0.0/16",
  MAX_AZS: 2,
});
