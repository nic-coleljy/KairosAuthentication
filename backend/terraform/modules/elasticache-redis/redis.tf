resource "aws_security_group" "redis_sg" {
  name        = "redis_sg"
  description = "Security group for Elasticache Redis"
  vpc_id      = var.vpc_id

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
    Name = var.redis_sg_name
  }
}

resource "aws_cloudwatch_log_group" "redis_slow" {
  name = "kairos_redis_slow"
  retention_in_days = 30

  tags = {
    Name = "kairos_redis_slow"
  }
}

resource "aws_cloudwatch_log_group" "redis_engine" {
  name = "kairos_redis_engine"
  retention_in_days = 30

  tags = {
    Name = "kairos_redis_engine"
  }
}

resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "kairos-redis-subnet-group"
  subnet_ids = [var.private_subnet_1_id, var.private_subnet_2_id]
}

resource "aws_elasticache_replication_group" "kairos_redis" {
  description                 = "Replication group for Kairos Redis"
  replication_group_id        = "kairos-redis"
  apply_immediately           = true
  auto_minor_version_upgrade  = true
  automatic_failover_enabled  = true
  engine                      = "redis"
  engine_version              = "6.2"
  final_snapshot_identifier   = "kairos-redis-final"
  multi_az_enabled            = true
  node_type                   = "cache.t4g.micro"
  num_cache_clusters          = 2
  parameter_group_name        = "default.redis6.x"
  port                        = 6379
  preferred_cache_cluster_azs = ["ap-southeast-1a", "ap-southeast-1b"]
  security_group_ids          = [aws_security_group.redis_sg.id]
  snapshot_retention_limit    = 7
  subnet_group_name           = aws_elasticache_subnet_group.redis_subnet_group.name
  transit_encryption_enabled  = true
  auth_token                  = var.redis_auth

  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_slow.name
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "slow-log"
  }

  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_engine.name
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "engine-log"
  }

  tags = {
    Name = var.redis_name
  }
}