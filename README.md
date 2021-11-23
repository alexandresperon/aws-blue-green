# AWS CloudFormation & Blue-Green Strategy Sample

This is a simple example demonstrating how to use CodeDeploy's macro in CloudFormation to deploy a ECS Fargate application using Blue/Green strategy.

## Pre-requisites

Your account must have a VPC to deploy the application into. Also, is necessary to have three VPCs Endpoints to allow communication between lambdas and the AWS Resources: CodeDeploy, LoadBalancer and SQS.

## How-to



` aws cloudformation create-stack --stack-name blue-green-poc-stack --template-body file://template.yml  `