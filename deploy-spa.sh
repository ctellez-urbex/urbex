#!/bin/bash

# Deploy SPA to S3 with CloudFront invalidation
# Usage: ./deploy-spa.sh [bucket-name] [cloudfront-distribution-id]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
BUCKET_NAME=${1:-"urbex.com.co-production"}
DISTRIBUTION_ID=${2}

echo -e "${YELLOW}🚀 Starting SPA deployment to S3 and CloudFront...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Build the application
echo -e "${YELLOW}📦 Building Next.js application...${NC}"
npm run build

# Check if build was successful
if [ ! -d "out" ]; then
    echo -e "${RED}❌ Build failed. 'out' directory not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Deploy to S3 with proper cache headers
echo -e "${YELLOW}📤 Uploading files to S3...${NC}"

# Upload static assets (JS, CSS, images) with long cache
aws s3 sync out/ s3://$BUCKET_NAME/ \
    --exclude "*" \
    --include "*.js" --include "*.css" --include "*.png" --include "*.jpg" --include "*.jpeg" --include "*.gif" --include "*.svg" --include "*.ico" --include "*.woff" --include "*.woff2" \
    --cache-control "public, max-age=31536000, immutable" \
    --delete

# Upload _next/static with long cache (Next.js assets)
aws s3 sync out/_next/static/ s3://$BUCKET_NAME/_next/static/ \
    --cache-control "public, max-age=31536000, immutable" \
    --delete

# Upload HTML files with short cache to ensure updates are seen quickly
aws s3 sync out/ s3://$BUCKET_NAME/ \
    --exclude "*" \
    --include "*.html" \
    --cache-control "public, max-age=0, must-revalidate" \
    --delete

# Upload remaining files with medium cache
aws s3 sync out/ s3://$BUCKET_NAME/ \
    --exclude "*.js" --exclude "*.css" --exclude "*.png" --exclude "*.jpg" --exclude "*.jpeg" --exclude "*.gif" --exclude "*.svg" --exclude "*.ico" --exclude "*.woff" --exclude "*.woff2" --exclude "*.html" \
    --cache-control "public, max-age=86400" \
    --delete

echo -e "${GREEN}✅ Files uploaded to S3 successfully${NC}"

# Invalidate CloudFront cache if distribution ID provided
if [ ! -z "$DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}🔄 Creating CloudFront invalidation...${NC}"
    
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id $DISTRIBUTION_ID \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    echo -e "${GREEN}✅ CloudFront invalidation created: $INVALIDATION_ID${NC}"
    echo -e "${YELLOW}⏳ Waiting for invalidation to complete...${NC}"
    
    aws cloudfront wait invalidation-completed \
        --distribution-id $DISTRIBUTION_ID \
        --id $INVALIDATION_ID
    
    echo -e "${GREEN}✅ CloudFront invalidation completed${NC}"
else
    echo -e "${YELLOW}⚠️  No CloudFront distribution ID provided. Skipping cache invalidation.${NC}"
    echo -e "${YELLOW}   Note: It may take up to 24 hours for changes to propagate without invalidation.${NC}"
fi

echo -e "${GREEN}🎉 SPA deployment completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Test the website in different routes (e.g., /dashboard, /auth/login)"
echo "2. Verify that browser refresh works on all routes"
echo "3. Check that 404 errors redirect to the main app"
echo ""
echo -e "${GREEN}✨ Your SPA is now live and should handle all routes correctly!${NC}" 