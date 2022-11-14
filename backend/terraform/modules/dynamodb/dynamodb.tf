resource "aws_dynamodb_table" "registration_table" {
  name             = "registration_list"
  billing_mode     = "PAY_PER_REQUEST"
  table_class      = "STANDARD"
  hash_key         = "email"
  stream_enabled   = true
  stream_view_type = "KEYS_ONLY"

  attribute {
    name = "email"
    type = "S"
  }

  replica {
    region_name = "us-east-1"
  }
} 