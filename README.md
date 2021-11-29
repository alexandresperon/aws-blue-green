# AWS CloudFormation & Blue-Green Strategy Sample

This is a simple example demonstrating how to use CodeDeploy's macro in CloudFormation to deploy a ECS Fargate application using Blue/Green strategy.

Must be known that this sample is **not** cover by the AWS free tier. 

## Pre-requisites

This samples needs a VPC to deploy the application and lambdas into. Also is necessary to have three VPCs Endpoints (a.k.a. AWS PrivateLink) to allow communication between lambdas and the AWS Resources: CodeDeploy, LoadBalancer and SQS.

To create VPCs Endpoints, see https://docs.aws.amazon.com/vpc/latest/privatelink/vpce-interface.html#vpce-view-services


## How-to


1. First, you will need to push a docker image of the application to ECR, this image will be used by the template to run the container. Start by creating a repository in AWS ECR for the image:

    ```sh
    aws ecr create-repository --repository-name blue-green-demo-app
    ```

2. Then using docker cli, build the application using the Dockerfile in blue-green-demo-app folder, you'll need to build the image using the repository you created above and tagging with v1:

    ```sh
    docker build -t $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/blue-green-demo-app:v1 blue-green-demo-app
    ```

3. Next log into docker with your ECR user using the command bellow, replace **ACCOUNT_ID** and **REGION** with the your AWS Account's number and region, respectively: 

    ```sh
    aws ecr get-login-password | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
    ```

4. Push the image to AWS ECR using `docker push` command:

    ```sh
    docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/blue-green-demo-app:v1
    ```

5. And finally run cloudformation `create-stack` command to create the stack:

    ```sh
    aws cloudformation create-stack --stack-name blue-green-poc-stack --template-body file://template.yml --parameters ParameterKey=Vpc,ParameterValue=$VPC_ID ParameterKey=Subnet1,ParameterValue=$SUBNET_1 ParameterKey=Subnet2,ParameterValue=$SUBNET_2 --capabilities CAPABILITY_AUTO_EXPAND CAPABILITY_NAMED_IAM
    ```

You can follow the creation process on CloudFormation page in AWS Console.

## Simulating Rollback

1. If you want to test how the rollback works, in app.js file change the property status from "OK" to something else. 

2. Then rebuild docker's image with a different tag, something like **blue=green-demo-app:v2** and push the new tag to ECR (steps 2 to 4 from before).
**
3. Change the **Image** property in **template.yml** file to point to the new tag and run `update-stack` command (similar to `create-stack`, but no need of *CAPABILITY_NAMED_IAM* capability because no changes in the IAM role was made):

    ```sh
    aws cloudformation update-stack --stack-name blue-green-poc-stack --template-body file://template.yml --parameters ParameterKey=Vpc,ParameterValue=$VPC_ID ParameterKey=Subnet1,ParameterValue=$SUBNET_1 ParameterKey=Subnet2,ParameterValue=$SUBNET_2 --capabilities CAPABILITY_AUTO_EXPAND
    ```

This modification will cause CloudFormation to start a new deploy and, because of the change in the status returned by the API, the lambda validation will fail, causing a rollback.

You can check the deploy status in CodeDeploy's page in AWS Console.


## Clean-up

To delete all resources created in this sample, just run the following commands:

```sh
#Deletes the cloudformation stack and all the resources
aws cloudformation delete-stack --stack-name blue-green-poc-stack

#Deletes the repository and it images
aws ecr delete-repository --repository-name blue-green-demo-app --force
```

If you created the VPC endpoints to do this samples, remember to also delete them.