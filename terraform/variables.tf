variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "azure_location" {
  description = "Azure location"
  type        = string
  default     = "East US"
}

variable "rpc_url" {
  description = "Solana RPC URL"
  type        = string
  sensitive   = true
}

variable "relayer_url" {
  description = "Relayer URL"
  type        = string
  sensitive   = true
}

variable "relayer_pubkey" {
  description = "Relayer public key"
  type        = string
  sensitive   = true
}

variable "treasury_pubkey" {
  description = "Treasury public key"
  type        = string
  sensitive   = true
}

variable "deployer_private_key" {
  description = "Deployer private key"
  type        = string
  sensitive   = true
}