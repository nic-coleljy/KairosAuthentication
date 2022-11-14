resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = var.vpc_name
  }
}

resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-southeast-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = var.public_subnet_1_name
    "kubernetes.io/cluster/${var.cluster_name}" = "owned"
    "kubernetes.io/role/elb" = 1
  }
}

resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "ap-southeast-1a"

  tags = {
    Name = var.private_subnet_1_name
    "kubernetes.io/cluster/${var.cluster_name}" = "owned"
    "kubernetes.io/role/internal-elb" = 1
  }
}

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.3.0/24"
  availability_zone       = "ap-southeast-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = var.public_subnet_2_name
    "kubernetes.io/cluster/${var.cluster_name}" = "owned"
    "kubernetes.io/role/elb" = 1
  }
}

resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "ap-southeast-1b"

  tags = {
    Name = var.private_subnet_2_name
    "kubernetes.io/cluster/${var.cluster_name}" = "owned"
    "kubernetes.io/role/internal-elb" = 1
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = var.igw_name
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = var.public_rt_name
  }
}

resource "aws_route_table_association" "public_1_to_public_rt" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_2_to_public_rt" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

resource "aws_eip" "ngw_1" {
  tags = {
    Name = var.ngw_1_name
  }
}

resource "aws_nat_gateway" "ngw_1" {
  allocation_id = aws_eip.ngw_1.id
  subnet_id     = aws_subnet.public_1.id

  tags = {
    Name = var.ngw_1_name
  }

  depends_on = [aws_internet_gateway.main]
}

resource "aws_route_table" "private_1" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.ngw_1.id
  }

  tags = {
    Name = var.private_rt_1_name
  }
}

resource "aws_route_table_association" "private_1_to_private_rt_1" {
  subnet_id      = aws_subnet.private_1.id
  route_table_id = aws_route_table.private_1.id
}

resource "aws_eip" "ngw_2" {
  tags = {
    Name = var.ngw_2_name
  }
}

resource "aws_nat_gateway" "ngw_2" {
  allocation_id = aws_eip.ngw_2.id
  subnet_id     = aws_subnet.public_2.id

  tags = {
    Name = var.ngw_2_name
  }

  depends_on = [aws_internet_gateway.main]
}

resource "aws_route_table" "private_2" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.ngw_2.id
  }

  tags = {
    Name = var.private_rt_2_name
  }
}

resource "aws_route_table_association" "private_2_to_private_rt_2" {
  subnet_id      = aws_subnet.private_2.id
  route_table_id = aws_route_table.private_2.id
}

resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id            = aws_vpc.main.id
  vpc_endpoint_type = "Gateway"
  service_name      = "com.amazonaws.ap-southeast-1.dynamodb"
  auto_accept       = true
  route_table_ids   = [aws_route_table.private_1.id, aws_route_table.private_2.id]

  tags = {
    Name = var.dynamodb_gateway_endpoint_name
  }
}