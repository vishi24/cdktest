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
  //constructor(scope: Construct, id: string, props: AwsEnvStackProps) {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    //const { config } = props;

    const vpc = new ec2.Vpc(this, "sbrc", {
      maxAzs: 2, // Use 2 Availability Zones
      cidr: "10.40.0.0/16", //configurable-parameterized
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
    //---------------Security Group-------------------------------
    // Create a Security Group - RDS
    const securityGroupRDS = new ec2.SecurityGroup(this, "RdsSecurityGroup", {
      vpc,
      allowAllOutbound: true,
      description: "Security group for RDS-Aurora Postgres",
    });

    // Add inbound rules to the security group - Needs to be checked

    securityGroupRDS.addIngressRule(
      ec2.Peer.ipv4("10.40.0.0/16"), //make configurable
      ec2.Port.tcp(5432),
      "Allow RDS traffic"
    );

    // Create a Security Group - EKS
    const securityGroupEKS = new ec2.SecurityGroup(this, "EKSSecurityGroup", {
      vpc,
      allowAllOutbound: true,
      description: "Security group for RDS-Aurora Postgres",
    });

    // Add inbound rules to the security group - Needs to be checked

    securityGroupEKS.addIngressRule(
      ec2.Peer.ipv4("10.40.0.0/16"), //make configurable
      ec2.Port.allTraffic(),
      "Allow RDS traffic"
    );

    //** Check outbound rule after provisioning
    //---------------Security Group-------------------------------

    //------------------SubnetGroup RDS------------------------------
    const subnetGroupRDS = new rds.SubnetGroup(this, "RDSSubnetGroup", {
      description: "Subnet for RDS Aurora",
      vpc: vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    });
    //------------------SubnetGroup RDS------------------------------

    //----------------RDS DB Parameter Group-------------------------------
    //* Commented as default will be taken
    // Define the RDS database parameter group
    // Define the Aurora RDS database parameter group for MySQL
    //https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_rds-readme.html
    // const parameterGroupRDS = new rds.ParameterGroup(
    //   this,
    //   "AuroraDBParameterGroup",
    //   {
    //     engine: rds.DatabaseClusterEngine.auroraPostgres({
    //       version: rds.AuroraPostgresEngineVersion.VER_14_6,
    //     }), // Specify Aurora MySQL engine
    //     description: "My Aurora RDS Parameter Group",
    //     // parameters: {
    //     //   // Add custom database parameters here
    //     //   character_set_client: "utf8mb4",
    //     //   character_set_connection: "utf8mb4",
    //     //   collation_connection: "utf8mb4_unicode_ci",
    //     // },
    //   }
    // );
    //----------------RDS DB Parameter Group-------------------------------

    //-----------RDS Provisioning Database cluster--- Start------------------------------
    // const kmsKey = new kms.Key(this, "RDSKmsKey", {
    //   enableKeyRotation: true, // Optional: Enable key rotation
    // });

    // const cluster = new rds.DatabaseCluster(this, "Database", {
    //   engine: rds.DatabaseClusterEngine.auroraPostgres({
    //     version: rds.AuroraPostgresEngineVersion.VER_14_6,
    //   }),
    //   vpc,
    //   writer: rds.ClusterInstance.serverlessV2("writer"),
    //   serverlessV2MinCapacity: 2,
    //   serverlessV2MaxCapacity: 2,
    //   defaultDatabaseName: "registry",
    //   storageEncryptionKey: kmsKey,
    //   securityGroups: [securityGroupRDS], // Attach the security group
    //   vpcSubnets: {
    //     subnetGroupName: "db-pvt-", // Replace with your subnet group name
    //   },
    // });

    //----------------RDS Provisioning Database cluster--- End-----------------

    //--------------EKS Provisioning - start-----------------------------------
    //we have to ask user to provide the IAM rolesg
    const iamRole = iam.Role.fromRoleArn(
      this,
      "MyIAMRole",
      "arn:aws:iam::370803901956:role/AWSReservedSSO_AWSAdministratorAccess_2961c11892dc6700"
    );

    // const eksCluster = new eks.Cluster(this, "sbrcEKS1", {
    //   vpc: vpc,
    //   vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }],
    //   defaultCapacity: 0, // we want to manage capacity our selves
    //   version: eks.KubernetesVersion.V1_27,
    //   securityGroup: securityGroupEKS,
    //   endpointAccess: eks.EndpointAccess.PUBLIC_AND_PRIVATE,
    //   //logging to be enabled clusterLogging as required
    // });
    const eksCluster = new eks.FargateCluster(this, "MyCluster", {
      vpc: vpc,
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

    //--------------EKS Provisioning - End-----------------------------------
    //-----------------------Exporting Values-----------------------------

    new cdk.CfnOutput(this, "ExportedVpcId", {
      value: vpc.vpcId,
      exportName: "SB-RCVPC", // This is the name by which it will be imported
    });
    //-----------------------Exporting Values-----------------------------
    //------------------------Route 53-----------------------------------
    // Define a Route 53 hosted zone
    // const hostedZone = new route53.HostedZone(this, "MyHostedZone", {
    //   zoneName: "example.com", // Replace with your domain name
    // });
    // //------------------------Route 53-----------------------------------

    // //--------------------EKS-------------------------------
    // const eksCluster = new eks.Cluster(this, "sbrcEKS", {
    //   vpc: vpc,
    //   vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }],
    //   defaultCapacity: 0, // we want to manage capacity our selves
    //   version: eks.KubernetesVersion.V1_27,
    // });
    // //--------------------EKS-------------------------------

    // //-----------------S3 Bucket------------------------------
    // const bucket = new s3.Bucket(this, "MyS3Bucket", {
    //   versioned: true, // Enable versioning for the bucket
    // });
    //-----------------S3 Bucket------------------------------

    //------------------CloudFront--------------------------------
    // const distribution = new cloudfront.Distribution(this, "myDist", {
    //   defaultBehavior: { origin: new origins.S3Origin(myBucket) },
    // });
    //------------------CloudFront--------------------------------
  }
}

const app = new cdk.App();

new sbrcStack(app, "sbrcStack");
//new sbrcStack(app, "sbrcStack", cdk.aws_config);
