import * as cdk from "aws-cdk-lib";
import * as helm from "aws-cdk-lib/aws-eks";
import { Construct } from "constructs";
import * as eks from "aws-cdk-lib/aws-eks";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class helmStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const vpc = ec2.Vpc.fromLookup(this, "SB-RCVPC", {
      vpcId: "vpc-09c0c359d8d0537c7",
      //   availabilityZones: ["aps1-az3", "aps1-az1"],
      //   publicSubnetIds: ["subnet-0a906b8d151a34ea0", "subnet-0b88badfa7d4ac407"],
    });

    const cluster = eks.Cluster.fromClusterAttributes(this, "MyEksCluster", {
      clusterName: "eks-sbrc-new-v2",
      kubectlRoleArn: "arn:aws:iam::370803901956:user/vishwajeet",
      vpc: vpc,
      //   eks.Vpc.fromVpcAttributes(this, "MyVpc", {
      //     vpcId: "vpc-09c0c359d8d0537c7",
      //     availabilityZones: ["aps1-az3", "aps1-az1"],
      //     publicSubnetIds: [
      //       "subnet-0a906b8d151a34ea0",
      //       "subnet-0b88badfa7d4ac407",
      //     ],
      //   }),
    });

    // Define the local path to your Helm chart folder
    const helmChartFolder = "../helm-deployment/infra/helm_charts";

    // Create a Helm chart using the local folder as the source
    new helm.HelmChart(this, "MyHelmChart", {
      cluster: cluster,
      chart: helmChartFolder,
      release: "sunbirdrc",
      values: {
        "global.secrets.DB_PASSWORD":
          "aSx6M3NEZ1B6dEV3Mm1eMllrPUVIXkZrbWUsX2Fe",
        //"global.secrets.ELASTIC_SEARCH_PASSWORD":"abc",
        //"global.secrets.KEYCLOAK_ADMIN_CLIENT_SECRET":"abc",
        // "global.secrets.KEYCLOAK_ADMIN_PASSWORD":"password",
        "global.secrets.MINIO_SECRET_KEY": "QUtJQVZNVk5DUVlDSTNIRTJCWEM=",
        "global.secrets.access_key":
          "QzJvenppM3ZRUlVsSndDb1RaWVRjSXBHY0VzSFQ2a00vTyt5MXozVw==",
        //"global.minio.bucket_key":"abc",
      },
    });
  }
}
