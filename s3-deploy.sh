#!/bin/bash

# Urbex S3 Deployment Script
# Usage: ./s3-deploy.sh [environment]
# Example: ./s3-deploy.sh production

set -e

ENVIRONMENT=${1:-production}
BUCKET_NAME="urbex.com.co-${ENVIRONMENT}"
CLOUDFRONT_DISTRIBUTION_ID="" # Set this after CloudFront is created

echo "🚀 Starting deployment to ${ENVIRONMENT} environment..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Build the project
echo "📦 Building the project..."
npm run build

# Check if build was successful
if [ ! -d "out" ]; then
    echo "❌ Build failed or 'out' directory not found."
    exit 1
fi

echo "📁 Build completed. Files in 'out' directory:"
ls -la out/

# Sync with S3 bucket - Static assets with long cache
echo "☁️ Syncing static assets to S3 bucket: ${BUCKET_NAME}..."
aws s3 sync out/ s3://${BUCKET_NAME} \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "*.html"

# Sync HTML files with short cache
echo "📄 Syncing HTML files to S3 bucket: ${BUCKET_NAME}..."
aws s3 sync out/ s3://${BUCKET_NAME} \
    --delete \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "*.html"

# Set proper content types
echo "🔧 Setting content types..."
aws s3 cp s3://${BUCKET_NAME}/ s3://${BUCKET_NAME}/ \
    --recursive \
    --metadata-directive REPLACE \
    --content-type "text/html" \
    --include "*.html"

# Invalidate CloudFront cache if distribution ID is set
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo "🔄 Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*"
    echo "✅ CloudFront cache invalidation started."
else
    echo "⚠️ CloudFront distribution ID not set. Skipping cache invalidation."
    echo "   Update CLOUDFRONT_DISTRIBUTION_ID in this script after creating CloudFront distribution."
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Website URL: https://urbex.com.co"
echo "📦 S3 Bucket: ${BUCKET_NAME}"

# Show bucket website endpoint
WEBSITE_ENDPOINT=$(aws s3api get-bucket-website --bucket ${BUCKET_NAME} --query 'WebsiteConfiguration' --output text 2>/dev/null || echo "Not configured")
if [ "$WEBSITE_ENDPOINT" != "Not configured" ]; then
    echo "🔗 S3 Website Endpoint: http://${BUCKET_NAME}.s3-website.${AWS_DEFAULT_REGION}.amazonaws.com"
fi 