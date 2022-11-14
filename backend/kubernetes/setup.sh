#!/bin/bash

set -e

region="ap-southeast-1"
account_id="731706226892"
registry_url="$account_id.dkr.ecr.$region.amazonaws.com" # 731706226892.dkr.ecr.ap-southeast-1.amazonaws.com


# # Create infrastructure
# terraform apply --auto-approve

# export AWS_ACCESS_KEY_ID=""
# export AWS_SECRET_ACCESS_KEY=""

# Update kubectl kubeconfig through AWS CLI - sometimes incompatible if the current kubeconfig file is populated or in the wrong format
aws eks update-kubeconfig --name "kairos"

# Create namespace
kubectl create namespace "kairos"

# Create secret for container images to use to authenticate to private registry - not crucial as ecr-token-refresher CronJob will create this secret too (must supply credentials in the CronJob manifest in ecr-token-refresher.yml)
kubectl create secret docker-registry "ecr-credentials" \
  --docker-server="$registry_url" \
  --docker-username="AWS" \
  --docker-password=$(aws ecr get-login-password) \
  --namespace="kairos"

kubectl apply -f "./manifests"

# Install ALB Controller from Helm chart
helm repo add eks https://aws.github.io/eks-charts
helm repo update
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName="kairos" \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set image.repository=602401143452.dkr.ecr.ap-southeast-1.amazonaws.com/amazon/aws-load-balancer-controller

# Deploy Metrics Server pre-req for Kubernetes Dashboard
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Deploy Kubernetes Dashboard
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.5.0/aio/deploy/recommended.yaml

# Get auth token for eks-admin SA to use for admin permissions in Kubernetes Dashboard and copy paste into Web UI
kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep eks-admin | awk '{print $1}')

# # Start Kubernetes Dashboard on localhost
# kubectl proxy
# URL for Kubernetes Dashboard
# http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/workloads?namespace=_all

# # Teardown infrastructure
# kubectl delete ingress/kairos-ingress -n kairos
# helm uninstall aws-load-balancer-controller -n kube-system
