// Example configuration for S3 deployment
// Copy this file to deploy-config.js and fill in your values

module.exports = {
  // AWS Configuration
  AWS_REGION: 'us-east-2', // Your AWS region
  S3_BUCKET_NAME: 'frontend-urbex', // Your S3 bucket name
  
  // Optional: CloudFront Distribution ID for cache invalidation
  CLOUDFRONT_DISTRIBUTION_ID: 'your-cloudfront-distribution-id',
  
  // Optional: Environment-specific settings
  ENVIRONMENT: 'production', // or 'staging'
  
  // Optional: Custom domain
  DOMAIN: 'urbex.com.co', // Your custom domain
};

// Usage:
// 1. Copy this file to deploy-config.js
// 2. Fill in your actual values
// 3. Set environment variables:
//    export AWS_ACCESS_KEY_ID="your-access-key"
//    export AWS_SECRET_ACCESS_KEY="your-secret-key"
//    export S3_BUCKET_NAME="your-bucket-name"
// 4. Run: npm run deploy 