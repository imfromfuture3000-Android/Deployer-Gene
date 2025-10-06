#!/usr/bin/env node
/**
 * Check AWS Settings
 */

const fs = require('fs');
const { execSync } = require('child_process');

function checkAWSSettings() {
  console.log('☁️ CHECKING AWS SETTINGS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Check AWS CLI
  try {
    const awsVersion = execSync('aws --version', { encoding: 'utf8' });
    console.log(`✅ AWS CLI: ${awsVersion.trim()}`);
  } catch (error) {
    console.log('❌ AWS CLI not installed');
  }
  
  // Check AWS credentials
  try {
    const awsConfig = execSync('aws configure list', { encoding: 'utf8' });
    console.log('\n📋 AWS Configuration:');
    console.log(awsConfig);
  } catch (error) {
    console.log('❌ AWS credentials not configured');
  }
  
  // Check environment variables
  console.log('\n🔍 AWS Environment Variables:');
  const awsEnvVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_DEFAULT_REGION',
    'AWS_PROFILE'
  ];
  
  awsEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      console.log(`✅ ${envVar}: ${value.substring(0, 8)}...`);
    } else {
      console.log(`❌ ${envVar}: Not set`);
    }
  });
  
  // Check AWS deployment files
  console.log('\n📁 AWS Deployment Files:');
  const awsFiles = [
    '.aws/credentials',
    '.aws/config',
    'deployment/aws-ec2.sh',
    'deployment/aws-lambda.sh',
    'deployment/aws-s3.sh'
  ];
  
  awsFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}: Found`);
    } else {
      console.log(`❌ ${file}: Not found`);
    }
  });
  
  // Check GitHub Actions AWS workflows
  console.log('\n🔄 GitHub Actions AWS Workflows:');
  const workflowFiles = [
    '.github/workflows/aws-deploy.yml',
    '.github/workflows/deploy-production.yml'
  ];
  
  workflowFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}: Found`);
    } else {
      console.log(`❌ ${file}: Not found`);
    }
  });
}

checkAWSSettings();