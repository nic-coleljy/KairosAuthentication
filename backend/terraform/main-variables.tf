variable "eks_cluster_policies" {
  description = "Policies to be attached to EKS cluster role"
  type = list
  default = [
              "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy" 
            ]
}

variable "managed_nodegroup_role_policies" {
  description = "Policies to be attached to EKS managed nodegroup role"
  type = list
  default = [
              "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy", 
              "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly", 
              "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
            ]
}

variable "cluster_name" {
  description = "Name of EKS cluster"
  type = string
  default = "kairos"
}