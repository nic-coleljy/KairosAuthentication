#/bin/bash

# Get credentials from ECR (requires AWS credentials configured)
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 731706226892.dkr.ecr.ap-southeast-1.amazonaws.com

# Tag image for ECR
docker tag kairos:local 731706226892.dkr.ecr.ap-southeast-1.amazonaws.com/kairos-backend:latest

# Push image to ECR
docker push 731706226892.dkr.ecr.ap-southeast-1.amazonaws.com/kairos-backend:latest