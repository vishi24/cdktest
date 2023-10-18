# Welcome to your CDK TypeScript project

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`SunbirdCdkStack`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

//Common
Exporting vpc from vpcstack
Get IAM details

EKS cluster
clusterName -- Should come from env file
ec2.Peer.ipv4 -- should come from env file
Attach Readonly role and test aws auth

RDS
DataBase String -- RDS endpoint
DataBases: base64encode -- Password for DB should be base64encoded

S3bucket -
S3 Bucket -- construct for S3 bucket and bucket name to be exposed
Create IAM user with secret key and access key and IAM policy to access s3 bucket
