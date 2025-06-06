# Urbex - AWS S3 + CloudFront Deployment Guide

This guide will help you deploy the Urbex website to AWS S3 with CloudFront CDN for optimal performance.

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Domain name** (urbex.com.co) configured in your DNS provider
4. **Node.js 18+** and npm

## Step 1: Install and Configure AWS CLI

```bash
# Install AWS CLI (if not already installed)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-2
# - Default output format: json
```

## Step 2: Deploy Infrastructure with CloudFormation

```bash
# Deploy the infrastructure stack
aws cloudformation create-stack \
  --stack-name urbex-infrastructure \
  --template-body file://infrastructure/cloudformation-template.yaml \
  --parameters ParameterKey=DomainName,ParameterValue=urbex.com.co \
               ParameterKey=Environment,ParameterValue=production \
  --capabilities CAPABILITY_IAM \
  --region us-east-1

# Monitor the stack creation (this can take 20-30 minutes due to SSL certificate validation)
aws cloudformation wait stack-create-complete --stack-name urbex-infrastructure --region us-east-1

# Get the outputs (including bucket name and CloudFront distribution ID)
aws cloudformation describe-stacks \
  --stack-name urbex-infrastructure \
  --region us-east-1 \
  --query 'Stacks[0].Outputs'
```

## Step 3: Update DNS Configuration

After the CloudFormation stack is created:

1. **Get the Name Servers** from the CloudFormation outputs
2. **Update your domain registrar** to use these name servers for urbex.com.co
3. **Wait for DNS propagation** (can take up to 48 hours)

## Step 4: Configure GitHub Secrets

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add:

### Required Secrets:
```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=urbex.com.co-production
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
DOMAIN_NAME=urbex.com.co

# Environment variables for build
NEXT_PUBLIC_AWS_REGION=us-east-2
NEXT_PUBLIC_AWS_USER_POOL_ID=us-east-2_Fpda5LMX0
NEXT_PUBLIC_AWS_CLIENT_ID=5kvmdd29oj2lpnq9b4j60gfe69
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=urbex.com.co
CONTACT_EMAIL=carlos.tellez@urbex.com.co
```

## Step 5: Manual Deployment (Alternative)

If you prefer manual deployment instead of GitHub Actions:

```bash
# Make the deployment script executable
chmod +x s3-deploy.sh

# Update the CloudFront Distribution ID in s3-deploy.sh
# Edit the file and set CLOUDFRONT_DISTRIBUTION_ID="your_distribution_id"

# Run deployment
./s3-deploy.sh production
```

## Step 6: Verify Deployment

1. **Check S3 bucket**: https://s3.console.aws.amazon.com/s3/buckets/urbex.com.co-production
2. **Check CloudFront**: https://console.aws.amazon.com/cloudfront/
3. **Access website**: https://urbex.com.co

## GitHub Actions Workflow

The deployment is automated via GitHub Actions (`.github/workflows/deploy-to-s3.yml`):

- **Triggers**: Push to `main` or `master` branch, or manual trigger
- **Process**:
  1. Build the Next.js project
  2. Sync files to S3 bucket
  3. Invalidate CloudFront cache
  4. Report deployment status

## Troubleshooting

### Common Issues:

1. **SSL Certificate Validation Failed**
   - Ensure DNS is properly configured
   - Certificate validation can take up to 30 minutes

2. **S3 Bucket Access Denied**
   - Check bucket policy and CORS configuration
   - Verify AWS credentials have proper permissions

3. **CloudFront Cache Issues**
   - Run invalidation: `aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"`
   - Wait 10-15 minutes for propagation

4. **Domain Not Resolving**
   - Check Route53 hosted zone configuration
   - Verify name servers are correctly set at domain registrar

### Useful Commands:

```bash
# Check CloudFormation stack status
aws cloudformation describe-stacks --stack-name urbex-infrastructure --region us-east-1

# List S3 bucket contents
aws s3 ls s3://urbex.com.co-production --recursive

# Check CloudFront distributions
aws cloudfront list-distributions --query 'DistributionList.Items[].{Id:Id,DomainName:DomainName,Status:Status}'

# Test website
curl -I https://urbex.com.co
```

## Environment-Specific Deployments

For different environments (staging, development):

```bash
# Deploy to staging
aws cloudformation create-stack \
  --stack-name urbex-infrastructure-staging \
  --template-body file://infrastructure/cloudformation-template.yaml \
  --parameters ParameterKey=DomainName,ParameterValue=staging.urbex.com.co \
               ParameterKey=Environment,ParameterValue=staging

# Deploy files to staging
./s3-deploy.sh staging
```

## Performance Optimization

The deployment includes several optimizations:

1. **Static Asset Caching**: 1 year cache for CSS, JS, images
2. **HTML Caching**: No cache for HTML files (immediate updates)
3. **CloudFront Compression**: Automatic gzip compression
4. **HTTP/2 Support**: Enabled by default
5. **Global CDN**: Content served from edge locations worldwide

## Security Features

1. **HTTPS Only**: All traffic redirected to HTTPS
2. **Origin Access Control**: S3 bucket only accessible via CloudFront
3. **Security Headers**: Added via CloudFront
4. **DNS Security**: DNSSEC support via Route53

## Cost Estimation

Monthly costs (approximate):

- **S3**: $5-15 (depending on storage and requests)
- **CloudFront**: $5-20 (depending on traffic)
- **Route53**: $0.50 (hosted zone)
- **Certificate Manager**: Free
- **Total**: ~$10-35/month

## Support

For deployment issues:
- Check AWS CloudFormation console for stack events
- Review GitHub Actions logs for build/deployment errors
- Contact: carlos.tellez@urbex.com.co 