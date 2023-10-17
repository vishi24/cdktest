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
type AwsEnvStackProps = StackProps & {
  config: Readonly<ConfigProps>;
};

export class rdsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AwsEnvStackProps) {
    //   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const { config } = props;
    const RDS_SEC_GRP_INGRESS = config.RDS_SEC_GRP_INGRESS;

    //-----------RDS Provisioning Database cluster--- Start------------------------------
    const kmsKey = new kms.Key(this, "RDSKmsKey", {
      enableKeyRotation: true, // Optional: Enable key rotation
    });
    const vpcId = cdk.Fn.importValue("SB-RCVPC");

    // ----------------Security Group Creation Start------------------------
    // Create a Security Group - RDS
    const securityGroupRDS = new ec2.SecurityGroup(this, "RdsSecurityGroup", {
      vpc: ec2.Vpc.fromLookup(this, "vpc", { vpcId }),
      allowAllOutbound: true,
      description: "Security group for RDS-Aurora Postgres",
    });

    // Add inbound rules to the security group - Needs to be checked

    securityGroupRDS.addIngressRule(
      //   ec2.Peer.ipv4("10.40.0.0/16"), //make configurable
      ec2.Peer.ipv4(RDS_SEC_GRP_INGRESS),
      ec2.Port.tcp(5432),
      "Allow RDS traffic"
    );
    // ----------------Security Group Creation End------------------------
    //------------------SubnetGroup RDS------------------------------
    const subnetGroupRDS = new rds.SubnetGroup(this, "RDSSubnetGroup", {
      description: "Subnet for RDS Aurora",
      vpc: ec2.Vpc.fromLookup(this, "vpc", { vpcId }),
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    });
    //------------------SubnetGroup RDS------------------------------

    const cluster = new rds.DatabaseCluster(this, "Database", {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_14_6,
      }),
      vpc: ec2.Vpc.fromLookup(this, "vpc", { vpcId }),
      writer: rds.ClusterInstance.serverlessV2("writer"),
      serverlessV2MinCapacity: 2,
      serverlessV2MaxCapacity: 2,
      defaultDatabaseName: "registry",
      storageEncryptionKey: kmsKey,
      securityGroups: [securityGroupRDS], // Attach the security group
      vpcSubnets: {
        subnetGroupName: "db-pvt-", // Replace with your subnet group name
      },
    });
  }
}

//----------------RDS Provisioning Database cluster--- End-----------------
