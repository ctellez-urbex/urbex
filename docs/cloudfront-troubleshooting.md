# CloudFront Troubleshooting Guide

## Error: NoSuchKey - index.html not found

### Problem
CloudFront returns a `NoSuchKey` error when trying to access `index.html`.

### Solutions

#### 1. Verify S3 Bucket Configuration

**Check if index.html exists in S3:**
```bash
# Using AWS CLI
aws s3 ls s3://your-bucket-name/index.html

# Or check the entire bucket contents
aws s3 ls s3://your-bucket-name/ --recursive
```

**Upload index.html manually if missing:**
```bash
# Upload the index.html file to the root of your bucket
aws s3 cp dist/index.html s3://your-bucket-name/index.html
```

#### 2. CloudFront Configuration

**Set Default Root Object:**
1. Go to CloudFront Distribution
2. Edit Distribution Settings
3. Set "Default Root Object" to `index.html`
4. Save changes

**Configure Error Pages:**
1. Go to CloudFront Distribution
2. Edit Distribution Settings
3. Go to "Error Pages" tab
4. Add custom error responses:
   - **404 Error**: Redirect to `/index.html` (200 status)
   - **403 Error**: Redirect to `/index.html` (200 status)

#### 3. S3 Bucket Policy

**Ensure bucket allows CloudFront access:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

#### 4. Automatic Deployment

**Use our deployment script:**
```bash
# Set environment variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export S3_BUCKET_NAME="your-bucket-name"

# Deploy
npm run deploy
```

#### 5. Manual Upload Process

**If you prefer manual upload:**
1. Run build: `npm run build:deploy`
2. Upload all files from `dist/` folder to S3 bucket
3. Ensure `index.html` is in the root of the bucket
4. Invalidate CloudFront cache

### Verification Steps

1. **Check S3 bucket contents:**
   ```bash
   aws s3 ls s3://your-bucket-name/ --recursive
   ```

2. **Test direct S3 access:**
   ```
   https://your-bucket-name.s3.amazonaws.com/index.html
   ```

3. **Test CloudFront URL:**
   ```
   https://your-cloudfront-domain.cloudfront.net/
   ```

4. **Check CloudFront logs:**
   - Enable CloudFront logging
   - Check for 404 errors in logs

### Common Issues

#### Issue: Files uploaded but still getting 404
**Solution:** Invalidate CloudFront cache
```bash
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

#### Issue: index.html exists but CloudFront can't find it
**Solution:** Check CloudFront origin settings
- Ensure origin path is correct
- Verify origin access settings

#### Issue: Mixed content errors
**Solution:** Ensure all resources use HTTPS
- Update image URLs to use HTTPS
- Check for hardcoded HTTP URLs

### Best Practices

1. **Always use the deployment script** for consistent uploads
2. **Set proper cache headers** for different file types
3. **Enable CloudFront logging** for debugging
4. **Use CloudFront invalidation** after deployments
5. **Test both S3 direct access and CloudFront** URLs

### Emergency Fix

If you need to fix the issue immediately:

```bash
# 1. Generate files
npm run build:deploy

# 2. Upload index.html manually
aws s3 cp dist/index.html s3://your-bucket-name/index.html

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/index.html"
``` 