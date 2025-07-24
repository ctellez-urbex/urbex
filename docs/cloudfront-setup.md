# CloudFront Setup Guide for Urbex

## 🎯 Overview

This guide will help you set up CloudFront to serve your Urbex application from S3 with optimal performance and caching.

## 📋 Prerequisites

1. **S3 Bucket**: `frontend-urbex` (already configured)
2. **AWS CLI**: Configured with appropriate permissions
3. **Domain**: Optional custom domain (e.g., urbex.com.co)

## 🚀 Step-by-Step Setup

### 1. Create CloudFront Distribution

#### Via AWS Console:
1. Go to CloudFront in AWS Console
2. Click "Create Distribution"
3. Configure Origin:
   - **Origin Domain**: Select your S3 bucket (`frontend-urbex.s3.amazonaws.com`)
   - **Origin Path**: Leave empty
   - **Origin Access**: Select "Origin access control settings (recommended)"
   - **Origin Access Control**: Create new control setting
   - **Viewer Protocol Policy**: "Redirect HTTP to HTTPS"
   - **Allowed HTTP Methods**: GET, HEAD, OPTIONS
   - **Cache Policy**: "CachingOptimized"
   - **Origin Request Policy**: "CORS-S3Origin"

#### Via AWS CLI:
```bash
# Create Origin Access Control
aws cloudfront create-origin-access-control \
  --name "urbex-s3-oac" \
  --origin-access-control-origin-type "s3" \
  --signing-behavior "always" \
  --signing-protocol "sigv4"

# Get the OAC ID from the response
OAC_ID="your-oac-id"

# Create CloudFront Distribution
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

### 2. CloudFront Configuration File

Create `cloudfront-config.json`:
```json
{
  "CallerReference": "urbex-distribution-$(date +%s)",
  "Comment": "Urbex Frontend Distribution",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-frontend-urbex",
        "DomainName": "frontend-urbex.s3.amazonaws.com",
        "OriginPath": "",
        "CustomHeaders": {
          "Quantity": 0
        },
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        },
        "OriginAccessControlId": "E2EXAMPLE123456789"
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-frontend-urbex",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "TrustedKeyGroups": {
      "Enabled": false,
      "Quantity": 0
    },
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 7,
      "Items": [
        "GET",
        "HEAD",
        "OPTIONS",
        "PUT",
        "POST",
        "PATCH",
        "DELETE"
      ],
      "CachedMethods": {
        "Quantity": 2,
        "Items": [
          "GET",
          "HEAD"
        ]
      }
    },
    "SmoothStreaming": false,
    "Compress": true,
    "LambdaFunctionAssociations": {
      "Quantity": 0
    },
    "FunctionAssociations": {
      "Quantity": 0
    },
    "FieldLevelEncryptionId": "",
    "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
    "OriginRequestPolicyId": "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf",
    "ResponseHeadersPolicyId": "",
    "RealTimeLogConfigArn": "",
    "RealtimeLogConfigArn": ""
  },
  "CacheBehaviors": {
    "Quantity": 0
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      },
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "Logging": {
    "Enabled": true,
    "IncludeCookies": false,
    "Bucket": "frontend-urbex-logs.s3.amazonaws.com",
    "Prefix": "cloudfront-logs/"
  },
  "PriceClass": "PriceClass_100",
  "Enabled": true,
  "ViewerCertificate": {
    "CloudFrontDefaultCertificate": true,
    "MinimumProtocolVersion": "TLSv1.2_2021",
    "CertificateSource": "cloudfront"
  },
  "Restrictions": {
    "GeoRestriction": {
      "RestrictionType": "none",
      "Quantity": 0
    }
  },
  "WebACLId": "",
  "HttpVersion": "http2",
  "IsIPV6Enabled": true
}
```

### 3. S3 Bucket Policy

Update your S3 bucket policy to allow CloudFront access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::frontend-urbex/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

### 4. Environment Variables

Set these environment variables for deployment:

```bash
export AWS_REGION="us-east-2"
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export S3_BUCKET_NAME="frontend-urbex"
export CF_DISTRIBUTION_ID="your-distribution-id"
```

### 5. Deploy Application

```bash
# Complete deployment with CloudFront invalidation
npm run deploy:complete
```

## 🔧 Configuration Details

### Cache Behaviors

#### Default Cache Behavior:
- **Cache Policy**: CachingOptimized
- **Origin Request Policy**: CORS-S3Origin
- **Compression**: Enabled
- **HTTP/2**: Enabled
- **IPv6**: Enabled

#### Custom Error Responses:
- **403 Error**: Redirect to `/index.html` (200 status)
- **404 Error**: Redirect to `/index.html` (200 status)

### Performance Optimizations

1. **Compression**: Enabled for text-based files
2. **HTTP/2**: Enabled for better performance
3. **IPv6**: Enabled for broader compatibility
4. **Price Class**: PriceClass_100 (US, Canada, Europe)

### Security Settings

1. **Viewer Protocol Policy**: Redirect HTTP to HTTPS
2. **Minimum Protocol Version**: TLSv1.2_2021
3. **Origin Access Control**: Enabled (recommended)

## 🧪 Testing

### 1. Test S3 Direct Access
```bash
# Test if files are accessible directly from S3
curl -I https://frontend-urbex.s3.amazonaws.com/index.html
```

### 2. Test CloudFront URL
```bash
# Test CloudFront distribution
curl -I https://your-distribution-id.cloudfront.net/
```

### 3. Test SPA Routing
```bash
# Test direct access to routes
curl -I https://your-distribution-id.cloudfront.net/auth/login
```

## 🔍 Monitoring

### CloudFront Metrics
- **Requests**: Monitor request volume
- **Error Rates**: Watch for 4xx/5xx errors
- **Cache Hit Ratio**: Should be >90% for static assets
- **Origin Latency**: Should be low for S3

### Logs
- **Access Logs**: Enable for debugging
- **Real-time Logs**: Optional for real-time monitoring

## 🚨 Troubleshooting

### Common Issues

#### Issue: 404 errors on direct route access
**Solution**: Verify custom error responses are configured
```bash
# Check error responses
aws cloudfront get-distribution-config --id YOUR_DISTRIBUTION_ID
```

#### Issue: Mixed content errors
**Solution**: Ensure all resources use HTTPS
- Check image URLs in your code
- Verify external resources use HTTPS

#### Issue: Cache not updating
**Solution**: Invalidate CloudFront cache
```bash
# Manual invalidation
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Performance Optimization

1. **Cache Headers**: Ensure proper cache headers are set
2. **Image Optimization**: Use WebP format where possible
3. **Code Splitting**: Leverage Next.js code splitting
4. **CDN**: CloudFront provides global edge locations

## 📊 Cost Optimization

1. **Price Class**: Use PriceClass_100 for cost savings
2. **Cache Hit Ratio**: Optimize for >90% cache hit ratio
3. **Compression**: Reduces bandwidth costs
4. **Logging**: Consider disabling logs in production

## 🔄 Continuous Deployment

### Automated Deployment Script
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment..."

# Build and deploy
npm run deploy:complete

# Wait for invalidation
echo "⏳ Waiting for CloudFront invalidation..."
sleep 30

# Test deployment
echo "🧪 Testing deployment..."
curl -I https://your-distribution-id.cloudfront.net/

echo "✅ Deployment complete!"
```

### GitHub Actions Workflow
```yaml
name: Deploy to CloudFront

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run deploy:complete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          S3_BUCKET_NAME: ${{ secrets.S3_BUCKET_NAME }}
          CF_DISTRIBUTION_ID: ${{ secrets.CF_DISTRIBUTION_ID }}
``` 