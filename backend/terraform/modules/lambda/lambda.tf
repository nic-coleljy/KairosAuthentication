resource "aws_cloudwatch_log_group" "jwks" {
  name              = "/aws/lambda/jwks"
  retention_in_days = 14
}

resource "aws_iam_role" "lambda_iam" {
  name = "kairos-lambda"
  managed_policy_arns = var.jwks_policies
  assume_role_policy = file("./policies/lambda-trust-policy.json")
}

resource "aws_iam_policy" "lambda_logging" {
  name        = "lambda_logging"
  path        = "/"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_iam.name
  policy_arn = aws_iam_policy.lambda_logging.arn
}

# resource "aws_lambda_layer_version" "jwks_python_layer" {
  
# }

# resource "aws_lambda_function" "jwks" {
#   # If the file is not in the current working directory you will need to include a
#   # path.module in the filename.
#   filename         = "jwks.zip"
#   function_name    = "jwks"
#   role             = aws_iam_role.lambda_iam.arn
#   # Python handler format file_name.function_name
#   handler          = "index.test"
#   # filename
#   source_code_hash = filebase64sha256("jwks.zip")
#   layers           = []
#   runtime          = "python3.9"

#   environment {
#     variables = {
#       var = "value"
#     }
#   }
# }
