variable "jwks_policies" {
  description = "Policies to be attached to JWKS lambda function"
  type = list
  default = [
              "arn:aws:iam::aws:policy/AmazonS3FullAccess", 
              "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
            ]
}