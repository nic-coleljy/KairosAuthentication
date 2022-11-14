variable "vpc_name" {
  description = "Name of VPC"
  type = string
  default = "kairos-vpc"
}

variable "private_subnet_1_name" {
  description = "Name of 1st private subnet"
  type = string
  default = "kairos-private-subnet-1"
}

variable "private_subnet_2_name" {
  description = "Name of 2nd private subnet"
  type = string
  default = "kairos-private-subnet-2"
}

variable "public_subnet_1_name" {
  description = "Name of 1st public subnet"
  type = string
  default = "kairos-public-subnet-1"
}

variable "public_subnet_2_name" {
  description = "Name of 2nd public subnet"
  type = string
  default = "kairos-public-subnet-2"
}

variable "igw_name" {
  description = "Name of Internet Gateway"
  type = string
  default = "kairos-igw"
}

variable "public_rt_name" {
  description = "Name of public route table"
  type = string
  default = "kairos-public-rt"
}

variable "ngw_1_name" {
  description = "Name of 1st NAT Gateway"
  type = string
  default = "kairos-ngw-1"
}

variable "ngw_2_name" {
  description = "Name of 2nd NAT Gateway"
  type = string
  default = "kairos-ngw-2"
}

variable "private_rt_1_name" {
  description = "Name of private route table 1"
  type = string
  default = "kairos-private-rt-1"
}

variable "private_rt_2_name" {
  description = "Name of private route table 2"
  type = string
  default = "kairos-private-rt-2"
}

variable "dynamodb_gateway_endpoint_name" {
  description = "Name of DynamoDB gateway endpoint"
  type = string
  default = "kairos-dynamodb-gateway-endpoint"
}

variable "cluster_name" {
  description = "Name of EKS cluster, value from root module eks.tf"
  type = string
}