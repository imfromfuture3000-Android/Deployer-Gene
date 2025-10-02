
# AWS Lambda Deployment (Free Tier)
aws lambda create-function --function-name genemint-processor --runtime nodejs18.x --role arn:aws:iam::account:role/lambda-execution-role --handler index.handler --zip-file fileb://function.zip --environment Variables='{DEPLOYER_KEY=zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4}'
