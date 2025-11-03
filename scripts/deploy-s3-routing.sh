#!/bin/bash

# Deploy script with S3 routing fix
# This script builds the app and deploys it to S3 with proper routing configuration

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration (update these values)
S3_BUCKET="urbex-frontend"
CLOUDFRONT_DISTRIBUTION_ID="E1234567890"  # Update with your actual distribution ID
AWS_REGION="us-east-2"

echo -e "${BLUE}🚀 Starting deployment with S3 routing fix...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Building the application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Please fix the errors and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

echo -e "${BLUE}🌐 Configuring S3 bucket for website hosting...${NC}"

# Configure S3 bucket for website hosting
aws s3 website s3://$S3_BUCKET \
    --index-document index.html \
    --error-document index.html \
    --region $AWS_REGION

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ S3 website configuration updated${NC}"
else
    echo -e "${YELLOW}⚠️  S3 website configuration may have failed (bucket might not exist)${NC}"
fi

echo -e "${BLUE}📤 Syncing files to S3...${NC}"

# Sync files to S3 with appropriate cache headers
aws s3 sync out/ s3://$S3_BUCKET \
    --delete \
    --region $AWS_REGION \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html" \
    --exclude "env.js"

# Upload HTML files with no-cache headers
aws s3 sync out/ s3://$S3_BUCKET \
    --delete \
    --region $AWS_REGION \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "*.html" \
    --include "env.js"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Files synced to S3 successfully${NC}"
else
    echo -e "${RED}❌ Failed to sync files to S3${NC}"
    exit 1
fi

# Set bucket policy for public read access
echo -e "${BLUE}🔒 Setting bucket policy for public access...${NC}"

BUCKET_POLICY='{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::'$S3_BUCKET'/*"
    }
  ]
}'

echo "$BUCKET_POLICY" | aws s3api put-bucket-policy \
    --bucket $S3_BUCKET \
    --policy file:///dev/stdin \
    --region $AWS_REGION

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Bucket policy updated${NC}"
else
    echo -e "${YELLOW}⚠️  Bucket policy update may have failed${NC}"
fi

# Invalidate CloudFront cache if distribution ID is provided
if [ "$CLOUDFRONT_DISTRIBUTION_ID" != "E1234567890" ]; then
    echo -e "${BLUE}🔄 Invalidating CloudFront cache...${NC}"
    
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ CloudFront invalidation created: $INVALIDATION_ID${NC}"
        echo -e "${BLUE}⏳ Waiting for invalidation to complete...${NC}"
        
        aws cloudfront wait invalidation-completed \
            --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
            --id $INVALIDATION_ID
        
        echo -e "${GREEN}✅ CloudFront cache invalidated${NC}"
    else
        echo -e "${YELLOW}⚠️  CloudFront invalidation failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  CloudFront distribution ID not configured, skipping cache invalidation${NC}"
    echo -e "${BLUE}💡 Update CLOUDFRONT_DISTRIBUTION_ID in this script to enable cache invalidation${NC}"
fi

# Display deployment information
echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "\n${BLUE}📋 Deployment Summary:${NC}"
echo -e "   S3 Bucket: s3://$S3_BUCKET"
echo -e "   Region: $AWS_REGION"
echo -e "   Website URL: http://$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com"

if [ "$CLOUDFRONT_DISTRIBUTION_ID" != "E1234567890" ]; then
    echo -e "   CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID"
fi

echo -e "\n${BLUE}🔧 Routing Configuration:${NC}"
echo -e "   ✅ S3 Error Document: index.html"
echo -e "   ✅ Cache Headers: Configured"
echo -e "   ✅ Public Access: Enabled"

echo -e "\n${BLUE}🧪 Testing URLs:${NC}"
echo -e "   Test direct access: https://yourdomain.com/dashboard"
echo -e "   Test auth routes: https://yourdomain.com/auth/login"
echo -e "   Test properties: https://yourdomain.com/properties"

echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo -e "   1. Configure CloudFront Custom Error Pages (404 → 200 + /index.html)"
echo -e "   2. Update DNS to point to CloudFront distribution"
echo -e "   3. Test all routes in production"

echo -e "\n${GREEN}✨ Happy deploying!${NC}"
