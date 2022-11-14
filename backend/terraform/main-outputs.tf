output "cluster_name" {
  description = "Name of EKS cluster"
  value       = aws_eks_cluster.main.name
}