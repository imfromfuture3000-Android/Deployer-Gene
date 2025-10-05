#!/bin/bash

# 🚀 AWS Infrastructure Deployment Script
# Deploys complete AWS infrastructure for mainnet Solana deployment

set -e

echo "🚀 DEPLOYING AWS INFRASTRUCTURE FOR MAINNET"
echo "============================================"
echo "⚠️  PRODUCTION ONLY - NO TESTNET"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Install it first:"
    echo "   curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'"
    echo "   unzip awscliv2.zip && sudo ./aws/install"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured"
    echo "   Run: aws configure"
    exit 1
fi

STACK_NAME="omega-prime-deployer"
REGION="us-east-1"

echo "✅ AWS CLI configured"
echo "📍 Region: $REGION"
echo "📦 Stack: $STACK_NAME"

# Create S3 bucket for CloudFormation templates
TEMPLATE_BUCKET="omega-prime-cf-templates-$(date +%s)"
aws s3 mb s3://$TEMPLATE_BUCKET --region $REGION
echo "✅ Template bucket created: $TEMPLATE_BUCKET"

# Upload CloudFormation template
aws s3 cp aws-infrastructure.yml s3://$TEMPLATE_BUCKET/
echo "✅ Template uploaded"

# Package Lambda function
echo "📦 Packaging Lambda function..."
zip -r lambda-deployment.zip aws-mainnet-deploy.js node_modules/ package.json
aws s3 cp lambda-deployment.zip s3://$TEMPLATE_BUCKET/
echo "✅ Lambda package uploaded"

# Deploy CloudFormation stack
echo "🚀 Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file aws-infrastructure.yml \
    --stack-name $STACK_NAME \
    --capabilities CAPABILITY_NAMED_IAM \
    --region $REGION \
    --parameter-overrides Environment=production

if [ $? -eq 0 ]; then
    echo "✅ CloudFormation stack deployed successfully"
else
    echo "❌ CloudFormation deployment failed"
    exit 1
fi

# Get stack outputs
echo "📊 Getting stack outputs..."
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`APIEndpoint`].OutputValue' \
    --output text)

LAMBDA_ARN=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`LambdaFunction`].OutputValue' \
    --output text)

EC2_INSTANCE=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`EC2Instance`].OutputValue' \
    --output text)

# Update Lambda function code
echo "🔄 Updating Lambda function code..."
aws lambda update-function-code \
    --function-name omega-prime-mainnet-deployer \
    --s3-bucket $TEMPLATE_BUCKET \
    --s3-key lambda-deployment.zip \
    --region $REGION

# Test deployment
echo "🧪 Testing deployment endpoint..."
curl -X POST $API_ENDPOINT \
    -H "Content-Type: application/json" \
    -d '{"test": true}' || echo "⚠️  Endpoint test failed (expected without auth)"

echo ""
echo "✅ AWS INFRASTRUCTURE DEPLOYED SUCCESSFULLY!"
echo "============================================"
echo "📍 API Endpoint: $API_ENDPOINT"
echo "🔧 Lambda ARN: $LAMBDA_ARN"
echo "💻 EC2 Instance: $EC2_INSTANCE"
echo ""
echo "🎯 Next Steps:"
echo "1. Configure AWS credentials with deployment permissions"
echo "2. Fund deployer wallet with SOL for mainnet transactions"
echo "3. Trigger deployment via API or Lambda"
echo ""
echo "🚀 Ready for mainnet deployment!"

# Cleanup
rm -f lambda-deployment.zip
aws s3 rm s3://$TEMPLATE_BUCKET --recursive
aws s3 rb s3://$TEMPLATE_BUCKET

echo "🧹 Cleanup complete"