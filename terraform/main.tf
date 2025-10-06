terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "azurerm" {
  features {}
}

resource "aws_lambda_function" "omega_deployer" {
  filename         = "lambda-deployment.zip"
  function_name    = "omega-deployer"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 300

  environment {
    variables = {
      RPC_URL            = var.rpc_url
      RELAYER_URL        = var.relayer_url
      RELAYER_PUBKEY     = var.relayer_pubkey
      TREASURY_PUBKEY    = var.treasury_pubkey
      DEPLOYER_PRIVATE_KEY = var.deployer_private_key
      MAINNET_ONLY       = "true"
    }
  }
}

resource "aws_iam_role" "lambda_role" {
  name = "omega-deployer-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "azurerm_resource_group" "omega_deployer" {
  name     = "omega-deployer-rg"
  location = var.azure_location
}

resource "azurerm_linux_function_app" "omega_deployer" {
  name                = "omega-deployer-func"
  resource_group_name = azurerm_resource_group.omega_deployer.name
  location            = azurerm_resource_group.omega_deployer.location
  service_plan_id     = azurerm_service_plan.omega_deployer.id
  storage_account_name = azurerm_storage_account.omega_deployer.name

  app_settings = {
    RPC_URL            = var.rpc_url
    RELAYER_URL        = var.relayer_url
    RELAYER_PUBKEY     = var.relayer_pubkey
    TREASURY_PUBKEY    = var.treasury_pubkey
    DEPLOYER_PRIVATE_KEY = var.deployer_private_key
    MAINNET_ONLY       = "true"
  }
}