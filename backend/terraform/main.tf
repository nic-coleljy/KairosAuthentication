# To setup:
# 1. Create "kairos-app-itsa" bucket in S3 manually in AWS console for Terraform state file
# 2. Create "kairos" keypair in EC2 manually in AWS console for use with ASG launch template

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.37.0"
    }
  }
  backend "s3" {
    bucket     = "kairos-app-itsa"
    key        = "terraform/state"
    region     = "ap-southeast-1"
  }
}

# ENV variables for access_key and secret_key in pipeline - secrets to be named AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
provider "aws" {
  region     = "ap-southeast-1"
}

module "dynamodb" {
  source = "./modules/dynamodb"
}

# Not in implementation plan, but terraform config files available for future use
# module "redis" {
#   source = "./modules/elasticache-redis"
#   vpc_id              = module.vpc.vpc_id
#   private_subnet_1_id = module.vpc.private_subnet_1_id
#   private_subnet_2_id = module.vpc.private_subnet_2_id
# }

module "lambda" {
  source = "./modules/lambda"
}

module "s3" {
  source = "./modules/s3"
}

module "vpc" {
  source = "./modules/vpc"
  cluster_name = var.cluster_name
}

resource "aws_security_group" "asg_instance_sg" {
  name        = "asg_instance_sg"
  description = "Security group for instances in the ASG"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description      = "default inbound rule"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  egress {
    description      = "default outbound rule"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  tags = {
    Name = "kairos-instance-sg"
  }
}

resource "aws_security_group" "alb_sg" {
  name        = "alb_sg"
  description = "Security group for ALB"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description      = "default inbound rule"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  egress {
    description      = "default outbound rule"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  tags = {
    Name = "kairos-alb-sg"
  }
}

resource "aws_iam_role" "eks_cluster" {
  name                = "eks-cluster-role"
  assume_role_policy  = file("./policies/eks-cluster-iam-trust-policy.json")
  managed_policy_arns = var.eks_cluster_policies
}

resource "aws_eks_cluster" "main" {
  name                      = var.cluster_name
  role_arn                  = aws_iam_role.eks_cluster.arn
  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
  version                   = "1.23"

  vpc_config {
    subnet_ids = [module.vpc.private_subnet_1_id, module.vpc.private_subnet_2_id]
  }

  depends_on = [aws_iam_role.eks_cluster, aws_cloudwatch_log_group.main]
}

resource "aws_cloudwatch_log_group" "main" {
  # The log group name format must be /aws/eks/<cluster-name>/cluster
  name              = "/aws/eks/${var.cluster_name}/cluster"
  retention_in_days = 7
}

data "tls_certificate" "main" {
  url = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "main" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.main.certificates[0].sha1_fingerprint]
  url             = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

data "aws_iam_policy_document" "alb_trust" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"

    condition {
      test     = "StringEquals"
      variable = "${replace(aws_iam_openid_connect_provider.main.url, "https://", "")}:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "${replace(aws_iam_openid_connect_provider.main.url, "https://", "")}:sub"
      values   = ["system:serviceaccount:kube-system:aws-load-balancer-controller"]
    }

    principals {
      identifiers = [aws_iam_openid_connect_provider.main.arn]
      type        = "Federated"
    }
  }
}

resource "aws_iam_role" "main_alb" {
  name                = "eks-app-alb-role"
  assume_role_policy  = data.aws_iam_policy_document.alb_trust.json

  inline_policy {
    name = "main_alb_policy"
    policy = file("./policies/alb-iam-policy.json")
  }
}

resource "aws_iam_role" "eks_managed_nodegroup_role" {
  name                = "eks-managed-nodegroup-role"
  assume_role_policy  = file("./policies/eks-managed-node-role-trust-policy.json")
  managed_policy_arns = var.managed_nodegroup_role_policies
}

resource "aws_eks_node_group" "group_1" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "app-managed-nodegroup-1"
  node_role_arn   = aws_iam_role.eks_managed_nodegroup_role.arn
  subnet_ids      = [module.vpc.private_subnet_1_id, module.vpc.private_subnet_2_id]
  ami_type        = "AL2_x86_64"
  instance_types  = ["t3.small"]

  scaling_config {
    desired_size = 2
    min_size     = 2
    max_size     = 4
  }

  remote_access {
    ec2_ssh_key = "kairos"
  }

  depends_on = [aws_iam_role.eks_managed_nodegroup_role]
}

resource "aws_eks_node_group" "group_2" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "app-managed-nodegroup-2"
  node_role_arn   = aws_iam_role.eks_managed_nodegroup_role.arn
  subnet_ids      = [module.vpc.private_subnet_1_id, module.vpc.private_subnet_2_id]
  ami_type        = "AL2_x86_64"
  instance_types  = ["t3.small"]

  scaling_config {
    desired_size = 2
    min_size     = 2
    max_size     = 4
  }

  remote_access {
    ec2_ssh_key = "kairos"
  }

  depends_on = [aws_iam_role.eks_managed_nodegroup_role]
}

resource "aws_eks_addon" "coredns" {
  cluster_name      = aws_eks_cluster.main.name
  addon_name        = "coredns"
  addon_version     = "v1.8.7-eksbuild.2"
  resolve_conflicts = "OVERWRITE"

  depends_on = [aws_eks_node_group.group_1, aws_eks_node_group.group_2]
}

resource "aws_eks_addon" "kube_proxy" {
  cluster_name      = aws_eks_cluster.main.name
  addon_name        = "kube-proxy"
  addon_version     = "v1.23.8-eksbuild.2"
  resolve_conflicts = "OVERWRITE"

  depends_on = [aws_eks_node_group.group_1, aws_eks_node_group.group_2]
}

resource "aws_eks_addon" "vpc_cni" {
  cluster_name      = aws_eks_cluster.main.name
  addon_name        = "vpc-cni"
  addon_version     = "v1.11.4-eksbuild.1"
  resolve_conflicts = "OVERWRITE"

  depends_on = [aws_eks_node_group.group_1, aws_eks_node_group.group_2]
}