// import * as cdk from "aws-cdk-lib";
// import * as helm from "aws-cdk-lib/aws-eks";
// import { Construct } from "constructs";
// import { eksStack } from "./eks-stack";

// class MyCdkStack extends cdk.Stack {
//   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
//     super(scope, id, props);

//     new helm.HelmChart(this, "SBRC-HelmChart", {
//       cluster: eksStack.e,
//       chart: "infra/helm_charts",
//       release: "sunbird-RC",
//       repository:
//         "https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/sunbird-rc-aws-automation", // Helm chart repository URL
//     });
//   }
// }
