
# AWS S3 Static Hosting (Free Tier)
aws s3 mb s3://nft-empire-storage
aws s3 website s3://nft-empire-storage --index-document index.html --error-document error.html
aws s3 sync ./build s3://nft-empire-storage
