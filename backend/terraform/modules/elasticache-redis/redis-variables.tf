variable "redis_sg_name" {
  description = "Name of security group to associate with ElastiCache Redis"
  type = string
  default = "kairos-redis-sg"
}

variable "redis_name" {
  description = "Name of ElastiCache Redis"
  type = string
  default = "kairos-redis"
}

variable "redis_auth" {
  description = "Password for Redis AUTH"
  type = string
  default = "kairos"
  sensitive = true
}

variable "vpc_id" {
  description = "ID of VPC from VPC module"
  type = string
}

variable "private_subnet_1_id" {
  description = "ID of private subnet 1 from VPC module"
  type = string
}

variable "private_subnet_2_id" {
  description = "ID of private subnet 2 from VPC module"
  type = string
}