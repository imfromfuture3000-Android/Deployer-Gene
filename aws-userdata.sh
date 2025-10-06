#!/bin/bash
# AWS EC2 User Data Script for Omega Deployer

# Update system
yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install Git
yum install -y git

# Create deployment directory
mkdir -p /opt/omega-deployer
cd /opt/omega-deployer

# Clone repository
git clone https://github.com/imfromfuture3000-Android/Omega-prime-deployer.git .

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
RPC_URL=${RPC_URL}
RELAYER_URL=${RELAYER_URL}
RELAYER_PUBKEY=${RELAYER_PUBKEY}
TREASURY_PUBKEY=${TREASURY_PUBKEY}
DEPLOYER_PRIVATE_KEY=${DEPLOYER_PRIVATE_KEY}
MAINNET_ONLY=true
EOF

# Create systemd service
cat > /etc/systemd/system/omega-deployer.service << EOF
[Unit]
Description=Omega Deployer Service
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/omega-deployer
ExecStart=/usr/bin/node mainnet-copilot.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl enable omega-deployer
systemctl start omega-deployer

# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
rpm -U ./amazon-cloudwatch-agent.rpm

echo "✅ AWS EC2 Omega Deployer Setup Complete"