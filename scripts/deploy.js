#!/usr/bin/env node

/**
 * Consolidated Deployment Script
 * 
 * Combines functionality from:
 * - deploy-complete.js (full deployment with CloudFront)
 * - deploy-to-s3.js (basic S3 deployment)
 * - prepare-deployment.js (file preparation)
 * 
 * Usage:
 *   node scripts/deploy.js                    # Full deployment (default)
 *   node scripts/deploy.js --prepare-only     # Only prepare files
 *   node scripts/deploy.js --s3-only          # Only deploy to S3 (no CloudFront)
 *   node scripts/deploy.js --help             # Show help
 */

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

// Parse command line arguments
const args = process.argv.slice(2);
const isPrepareOnly = args.includes('--prepare-only');
const isS3Only = args.includes('--s3-only');
const showHelp = args.includes('--help');

if (showHelp) {
  console.log(`
🚀 Deployment Script - Usage Options:

  node scripts/deploy.js                    # Full deployment (default)
  node scripts/deploy.js --prepare-only     # Only prepare files for deployment
  node scripts/deploy.js --s3-only          # Only deploy to S3 (no CloudFront)
  node scripts/deploy.js --help             # Show this help

Environment Variables Required:
  - S3_BUCKET_NAME: Your S3 bucket name
  - AWS_REGION: AWS region (default: us-east-2)
  - AWS_ACCESS_KEY_ID: AWS access key
  - AWS_SECRET_ACCESS_KEY: AWS secret key
  - CF_DISTRIBUTION_ID: CloudFront distribution ID (optional)
`);
  process.exit(0);
}

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();
const cloudfront = new AWS.CloudFront();

const bucketName = process.env.S3_BUCKET_NAME;
const distributionId = process.env.CF_DISTRIBUTION_ID;

if (!bucketName) {
  console.error('❌ S3_BUCKET_NAME environment variable is required');
  process.exit(1);
}

const sourceDir = path.join(__dirname, '..', '.next');
const distDir = path.join(__dirname, '..', 'dist');

// ============================================================================
// FILE PREPARATION FUNCTIONS
// ============================================================================

function copyStaticFiles() {
  const staticDir = path.join(sourceDir, 'static');
  const distStaticDir = path.join(distDir, '_next', 'static');
  
  if (fs.existsSync(staticDir)) {
    if (!fs.existsSync(distStaticDir)) {
      fs.mkdirSync(distStaticDir, { recursive: true });
    }
    copyDirectory(staticDir, distStaticDir);
    console.log('✅ Static files copied');
  }
}

function copyPublicFiles() {
  const publicDir = path.join(__dirname, '..', 'public');
  if (fs.existsSync(publicDir)) {
    copyDirectory(publicDir, distDir);
    console.log('✅ Public files copied');
  }
}

function copyIndexHtml() {
  const indexPath = path.join(sourceDir, 'index.html');
  const distIndexPath = path.join(distDir, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, distIndexPath);
    console.log('✅ index.html copied to root');
  }
}

function copyServerFiles() {
  const serverDir = path.join(sourceDir, 'server', 'app');
  const distServerDir = path.join(distDir, 'server', 'app');
  
  if (fs.existsSync(serverDir)) {
    if (!fs.existsSync(distServerDir)) {
      fs.mkdirSync(distServerDir, { recursive: true });
    }
    
    const files = fs.readdirSync(serverDir);
    files.forEach(file => {
      if (file === 'page.js' || file.endsWith('.js')) {
        const sourcePath = path.join(serverDir, file);
        const destPath = path.join(distServerDir, file);
        fs.copyFileSync(sourcePath, destPath);
      }
    });
    console.log('✅ Server files copied');
  }
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function createDeploymentGuide() {
  const guide = `# Deployment Guide for CloudFront + S3

## Files Generated
- \`index.html\` - Main entry point for CloudFront
- \`_next/static/\` - Static assets (JS, CSS, images)
- \`public/\` - Public assets (images, favicon, etc.)
- \`server/app/\` - Server-side files

## Upload to S3
1. Upload all files from the \`dist\` folder to your S3 bucket
2. Make sure \`index.html\` is in the root of the bucket
3. Set the bucket as a static website hosting

## CloudFront Configuration
1. Set the default root object to \`index.html\`
2. Configure error pages:
   - 404: \`/index.html\` (for SPA routing)
   - 403: \`/index.html\`

## Important Notes
- The \`index.html\` file redirects to the main application
- All API routes are handled by your backend server
- Static pages are pre-rendered for better performance

## Testing
After deployment, visit your CloudFront URL to verify the site loads correctly.
`;

  fs.writeFileSync(path.join(distDir, 'DEPLOYMENT.md'), guide);
  console.log('✅ Deployment guide created');
}

async function prepareFiles() {
  console.log('🚀 Preparing files for deployment...');
  
  // Create dist directory if it doesn't exist
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  try {
    copyStaticFiles();
    copyPublicFiles();
    copyIndexHtml();
    copyServerFiles();
    createDeploymentGuide();
    
    console.log('\n✅ Deployment preparation completed!');
    console.log(`📁 Files ready in: ${distDir}`);
    
    if (isPrepareOnly) {
      console.log('📋 Upload all files from the dist folder to your S3 bucket');
      console.log('🔗 Make sure index.html is in the root of the bucket');
    }
    
  } catch (error) {
    console.error('❌ Error preparing deployment:', error);
    process.exit(1);
  }
}

// ============================================================================
// S3 DEPLOYMENT FUNCTIONS
// ============================================================================

async function uploadFile(filePath, key) {
  const fileContent = fs.readFileSync(filePath);
  const contentType = mime.lookup(filePath) || 'application/octet-stream';
  
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    CacheControl: getCacheControl(filePath),
  };

  try {
    await s3.upload(params).promise();
    console.log(`✅ Uploaded: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Error uploading ${key}:`, error.message);
    return false;
  }
}

function getCacheControl(filePath) {
  const ext = path.extname(filePath);
  
  // Static assets with long cache
  if (['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'].includes(ext)) {
    return 'public, max-age=31536000, immutable'; // 1 year
  }
  
  // HTML files with short cache
  if (ext === '.html') {
    return 'public, max-age=0, must-revalidate';
  }
  
  // Default cache
  return 'public, max-age=3600'; // 1 hour
}

async function uploadDirectory(dirPath, prefix = '') {
  const items = fs.readdirSync(dirPath);
  let successCount = 0;
  let totalCount = 0;
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Recursively upload subdirectories
      const result = await uploadDirectory(fullPath, `${prefix}${item}/`);
      successCount += result.success;
      totalCount += result.total;
    } else {
      // Upload file
      const key = `${prefix}${item}`;
      const success = await uploadFile(fullPath, key);
      if (success) successCount++;
      totalCount++;
    }
  }
  
  return { success: successCount, total: totalCount };
}

async function verifyBucketConfig() {
  try {
    await s3.headBucket({ Bucket: bucketName }).promise();
    console.log(`✅ S3 bucket '${bucketName}' is accessible`);
    
    try {
      const policy = await s3.getBucketPolicy({ Bucket: bucketName }).promise();
      console.log('✅ Bucket policy is configured');
    } catch (error) {
      if (error.code === 'NoSuchBucketPolicy') {
        console.log('⚠️  No bucket policy found - CloudFront may not work properly');
      } else {
        console.log('⚠️  Could not verify bucket policy');
      }
    }
    
    try {
      const website = await s3.getBucketWebsite({ Bucket: bucketName }).promise();
      console.log('✅ Bucket website configuration found');
    } catch (error) {
      console.log('⚠️  No website configuration found - this is optional for CloudFront');
    }
    
  } catch (error) {
    console.error(`❌ Error accessing S3 bucket '${bucketName}':`, error.message);
    throw error;
  }
}

async function verifyIndexHtml() {
  try {
    await s3.headObject({
      Bucket: bucketName,
      Key: 'index.html'
    }).promise();
    console.log('✅ index.html verified in S3 bucket root');
    return true;
  } catch (error) {
    console.error('❌ index.html not found in S3 bucket root');
    console.error('This will cause CloudFront to return 404 errors');
    return false;
  }
}

async function deployToS3() {
  console.log('🚀 Starting S3 deployment...');
  console.log(`📦 Bucket: ${bucketName}`);
  console.log(`📁 Source: ${distDir}`);
  
  if (!fs.existsSync(distDir)) {
    console.error('❌ dist directory not found. Run npm run build:deploy first.');
    process.exit(1);
  }
  
  try {
    // Verify bucket configuration
    console.log('🔍 Verifying S3 bucket configuration...');
    await verifyBucketConfig();
    console.log('');
    
    // Upload all files
    console.log('📤 Uploading files to S3...');
    const uploadResult = await uploadDirectory(distDir);
    console.log(`📊 Upload complete: ${uploadResult.success}/${uploadResult.total} files uploaded successfully`);
    console.log('');
    
    // Verify critical files
    console.log('🔍 Verifying critical files...');
    const indexExists = await verifyIndexHtml();
    console.log('');
    
    if (indexExists) {
      console.log('✅ S3 deployment completed successfully!');
      console.log('🔗 Your site should be available at your S3 website URL');
    } else {
      console.log('⚠️  S3 deployment completed with warnings');
    }
    
  } catch (error) {
    console.error('❌ S3 deployment failed:', error.message);
    process.exit(1);
  }
}

// ============================================================================
// CLOUDFRONT FUNCTIONS
// ============================================================================

async function invalidateCloudFront() {
  if (!distributionId) {
    console.log('⚠️  CF_DISTRIBUTION_ID not set, skipping cache invalidation');
    return;
  }

  try {
    const params = {
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `invalidation-${Date.now()}`,
        Paths: {
          Quantity: 1,
          Items: ['/*']
        }
      }
    };

    const result = await cloudfront.createInvalidation(params).promise();
    console.log('✅ CloudFront cache invalidation created');
    console.log(`🆔 Invalidation ID: ${result.Invalidation.Id}`);
    console.log(`📊 Status: ${result.Invalidation.Status}`);
  } catch (error) {
    console.error('❌ Error invalidating CloudFront cache:', error.message);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 Starting deployment process...\n');
  
  if (isPrepareOnly) {
    await prepareFiles();
    return;
  }
  
  // Always prepare files first
  await prepareFiles();
  console.log('');
  
  if (isS3Only) {
    await deployToS3();
  } else {
    // Full deployment
    console.log('🌐 Full deployment mode (S3 + CloudFront)');
    console.log(`📦 Bucket: ${bucketName}`);
    console.log(`🌐 CloudFront Distribution: ${distributionId || 'Not configured'}`);
    console.log('');
    
    await deployToS3();
    console.log('');
    
    // Invalidate CloudFront cache
    console.log('🔄 Invalidating CloudFront cache...');
    await invalidateCloudFront();
    console.log('');
    
    console.log('🎉 Full deployment completed successfully!');
    console.log('🔗 Your site should be available at your CloudFront URL');
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
}); 