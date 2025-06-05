#!/bin/bash

# Build the project
npm run export

# Sync with S3 bucket
aws s3 sync out/ s3://your-bucket-name --delete

# Invalidate CloudFront cache (if using CloudFront)
# aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*" 