provider "aws" {
  region = "ap-southeast-1"
}

provider "aws" {
  alias  = "secondary"
  region = "us-east-1"
}

# resource "aws_iam_role" "site_replication" {
#   name = "kairos-site-replication-role"

#   assume_role_policy = <<POLICY
# {
#   "Version": "2012-10-17",
#   "Statement": [
#     {
#       "Action": "sts:AssumeRole",
#       "Principal": {
#         "Service": "s3.amazonaws.com"
#       },
#       "Effect": "Allow",
#       "Sid": ""
#     }
#   ]
# }
# POLICY
# }

# resource "aws_iam_policy" "site_replication" {
#   name = "kairos-site-replication-policy"

#   policy = <<POLICY
# {
#   "Version": "2012-10-17",
#   "Statement": [
#     {
#       "Action": [
#         "s3:GetReplicationConfiguration",
#         "s3:ListBucket"
#       ],
#       "Effect": "Allow",
#       "Resource": [
#         "${aws_s3_bucket.static_site.arn}",
#         "${aws_s3_bucket.static_site_2.arn}"
#       ]
#     },
#     {
#       "Action": [
#         "s3:GetObjectVersionForReplication",
#         "s3:GetObjectVersionAcl",
#          "s3:GetObjectVersionTagging"
#       ],
#       "Effect": "Allow",
#       "Resource": [
#         "${aws_s3_bucket.static_site.arn}/*",
#         "${aws_s3_bucket.static_site_2.arn}/*"
#       ]
#     },
#     {
#       "Action": [
#         "s3:ReplicateObject",
#         "s3:ReplicateDelete",
#         "s3:ReplicateTags"
#       ],
#       "Effect": "Allow",
#       "Resource": [
#         "${aws_s3_bucket.static_site.arn}/*",
#         "${aws_s3_bucket.static_site_2.arn}/*"
#       ]
#     }
#   ]
# }
# POLICY
# }

# resource "aws_iam_role_policy_attachment" "site_replication" {
#   role       = aws_iam_role.site_replication.name
#   policy_arn = aws_iam_policy.site_replication.arn
# }


resource "aws_s3_bucket" "logging" {
  bucket = "kairos-s3-logs"
}

resource "aws_s3_bucket_acl" "logging_acl" {
  bucket = aws_s3_bucket.logging.id
  acl    = "log-delivery-write"
}

resource "aws_s3_bucket" "logging_2" {
  provider = aws.secondary
  bucket = "kairos-s3-logs-2"
}

resource "aws_s3_bucket_acl" "logging_acl_2" {
  provider = aws.secondary
  bucket = aws_s3_bucket.logging_2.id
  acl    = "log-delivery-write"
}

# resource "aws_s3_bucket" "static_site" {
#   bucket = "kairos-static-site"
# }

# resource "aws_s3_bucket_acl" "static_site_acl" {
#   bucket = aws_s3_bucket.static_site.id
#   acl    = "public-read"
# }

# resource "aws_s3_bucket_logging" "static_site_logging" {
#   bucket = aws_s3_bucket.static_site.id

#   target_bucket = aws_s3_bucket.logging.id
#   target_prefix = "static_site_log/"
# }

# resource "aws_s3_bucket_cors_configuration" "static_site_cors" {
#   bucket = aws_s3_bucket.static_site.id

#   cors_rule {
#     allowed_methods = ["GET"]
#     allowed_origins = ["*"]
#   }
# }

# resource "aws_s3_bucket_website_configuration" "static_site_hosting" {
#   bucket = aws_s3_bucket.static_site.id

#   index_document {
#     suffix = "index.html"
#   }

#   error_document {
#     key = "error.html"
#   }

#   routing_rule {
#     condition {
#       key_prefix_equals = "docs/"
#     }
#     redirect {
#       replace_key_prefix_with = "documents/"
#     }
#   }
# }

# resource "aws_s3_bucket_versioning" "static_site_versioning" {
#   bucket = aws_s3_bucket.static_site.id

#   versioning_configuration {
#     status = "Enabled"
#   }
# }

# resource "aws_s3_bucket" "static_site_2" {
#   provider = aws.secondary
#   bucket   = "kairos-static-site-2"
# }

# resource "aws_s3_bucket_acl" "static_site_2_acl" {
#   provider = aws.secondary
#   bucket = aws_s3_bucket.static_site_2.id
#   acl    = "public-read"
# }

# resource "aws_s3_bucket_logging" "static_site_2_logging" {
#   provider = aws.secondary
#   bucket = aws_s3_bucket.static_site_2.id

#   target_bucket = aws_s3_bucket.logging.id
#   target_prefix = "static_site_2_log/"
# }

# resource "aws_s3_bucket_cors_configuration" "static_site_2_cors" {
#   provider = aws.secondary
#   bucket = aws_s3_bucket.static_site_2.id

#   cors_rule {
#     allowed_methods = ["GET"]
#     allowed_origins = ["*"]
#   }
# }

# resource "aws_s3_bucket_website_configuration" "static_site_2_hosting" {
#   provider = aws.secondary
#   bucket = aws_s3_bucket.static_site_2.id

#   index_document {
#     suffix = "index.html"
#   }

#   error_document {
#     key = "error.html"
#   }

#   routing_rule {
#     condition {
#       key_prefix_equals = "docs/"
#     }
#     redirect {
#       replace_key_prefix_with = "documents/"
#     }
#   }
# }

# resource "aws_s3_bucket_versioning" "static_site_2_versioning" {
#   provider = aws.secondary
#   bucket = aws_s3_bucket.static_site_2.id

#   versioning_configuration {
#     status = "Enabled"
#   }
# }

# resource "aws_s3_bucket_replication_configuration" "site_replication_1_to_2" {
#   depends_on = [aws_s3_bucket_versioning.static_site]

#   role   = aws_iam_role.site_replication.arn
#   bucket = aws_s3_bucket.static_site.id

#   rule {
#     id = "site_main"

#     status = "Enabled"

#     destination {
#       bucket        = aws_s3_bucket.static_site_2.arn
#       storage_class = "STANDARD"
#     }
#   }
# }

# resource "aws_s3_bucket_replication_configuration" "site_replication_2_to_1" {
#   provider = aws.secondary
#   depends_on = [aws_s3_bucket_versioning.static_site_2]

#   role   = aws_iam_role.site_replication.arn
#   bucket = aws_s3_bucket.static_site_2.id

#   rule {
#     id = "site_main_2"

#     status = "Enabled"

#     destination {
#       bucket        = aws_s3_bucket.static_site.arn
#       storage_class = "STANDARD"
#     }
#   }
# }

resource "aws_iam_role" "jwks_replication" {
  name = "kairos-jwks-replication-role"

  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "s3.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
POLICY
}

resource "aws_iam_policy" "jwks_replication" {
  name = "kairos-jwks-replication-policy"

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:GetReplicationConfiguration",
        "s3:ListBucket"
      ],
      "Effect": "Allow",
      "Resource": [
        "${aws_s3_bucket.jwks.arn}",
        "${aws_s3_bucket.jwks_2.arn}"
      ]
    },
    {
      "Action": [
        "s3:GetObjectVersionForReplication",
        "s3:GetObjectVersionAcl",
         "s3:GetObjectVersionTagging"
      ],
      "Effect": "Allow",
      "Resource": [
        "${aws_s3_bucket.jwks.arn}/*",
        "${aws_s3_bucket.jwks_2.arn}/*"
      ]
    },
    {
      "Action": [
        "s3:ReplicateObject",
        "s3:ReplicateDelete",
        "s3:ReplicateTags"
      ],
      "Effect": "Allow",
      "Resource": [
        "${aws_s3_bucket.jwks.arn}/*",
        "${aws_s3_bucket.jwks_2.arn}/*"
      ]
    }
  ]
}
POLICY
}

resource "aws_iam_role_policy_attachment" "jwks_replication" {
  role       = aws_iam_role.jwks_replication.name
  policy_arn = aws_iam_policy.jwks_replication.arn
}

resource "aws_s3_bucket" "jwks" {
    bucket = "kairos-jwks"
}

resource "aws_s3_bucket_acl" "jwks_acl" {
  bucket = aws_s3_bucket.jwks.id
  acl    = "public-read"
}

resource "aws_s3_bucket_logging" "jwks_logging" {
  bucket = aws_s3_bucket.jwks.id

  target_bucket = aws_s3_bucket.logging.id
  target_prefix = "jwks_log/"
}

resource "aws_s3_bucket_cors_configuration" "jwks_cors" {
  bucket = aws_s3_bucket.jwks.id

  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
  }
}

resource "aws_s3_bucket_versioning" "jwks_versioning" {
  bucket = aws_s3_bucket.jwks.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket" "jwks_2" {
  provider = aws.secondary
  bucket = "kairos-jwks-2"
}

resource "aws_s3_bucket_acl" "jwks_2_acl" {
  provider = aws.secondary
  bucket = aws_s3_bucket.jwks_2.id
  acl    = "public-read"
}

resource "aws_s3_bucket_logging" "jwks_2_logging" {
  provider = aws.secondary
  bucket = aws_s3_bucket.jwks_2.id

  target_bucket = aws_s3_bucket.logging_2.id
  target_prefix = "jwks_2_log/"
}

resource "aws_s3_bucket_cors_configuration" "jwks_2_cors" {
  provider = aws.secondary
  bucket = aws_s3_bucket.jwks_2.id

  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
  }
}

resource "aws_s3_bucket_versioning" "jwks_2_versioning" {
  provider = aws.secondary
  bucket = aws_s3_bucket.jwks_2.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_replication_configuration" "jwks_replication_1_to_2" {
  depends_on = [aws_s3_bucket_versioning.jwks_versioning, aws_s3_bucket_versioning.jwks_2_versioning]

  role   = aws_iam_role.jwks_replication.arn
  bucket = aws_s3_bucket.jwks.id

  rule {
    id = "jwks_main"

    status = "Enabled"

    destination {
      bucket        = aws_s3_bucket.jwks_2.arn
      storage_class = "STANDARD"
    }
  }
}

resource "aws_s3_bucket_replication_configuration" "jwks_replication_2_to_1" {
  provider = aws.secondary
  depends_on = [aws_s3_bucket_versioning.jwks_versioning, aws_s3_bucket_versioning.jwks_2_versioning]

  role   = aws_iam_role.jwks_replication.arn
  bucket = aws_s3_bucket.jwks_2.id

  rule {
    id = "jwks_main_2"

    status = "Enabled"

    destination {
      bucket        = aws_s3_bucket.jwks.arn
      storage_class = "STANDARD"
    }
  }
}