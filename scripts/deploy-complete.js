const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

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

const distDir = path.join(__dirname, '..', 'dist');

// Function to upload a file to S3
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

// Function to get cache control headers
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

// Function to upload directory recursively
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

// Function to invalidate CloudFront cache
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

// Function to verify S3 bucket configuration
async function verifyBucketConfig() {
  try {
    // Check if bucket exists and is accessible
    await s3.headBucket({ Bucket: bucketName }).promise();
    console.log(`✅ S3 bucket '${bucketName}' is accessible`);
    
    // Check bucket policy
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
    
    // Check website configuration
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

// Function to verify index.html was uploaded
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

// Main deployment function
async function deploy() {
  console.log('🚀 Starting complete deployment to S3 + CloudFront...');
  console.log(`📦 Bucket: ${bucketName}`);
  console.log(`🌐 CloudFront Distribution: ${distributionId || 'Not configured'}`);
  console.log(`📁 Source: ${distDir}`);
  console.log('');
  
  if (!fs.existsSync(distDir)) {
    console.error('❌ dist directory not found. Run npm run build:deploy first.');
    process.exit(1);
  }
  
  try {
    // Step 1: Verify bucket configuration
    console.log('🔍 Verifying S3 bucket configuration...');
    await verifyBucketConfig();
    console.log('');
    
    // Step 2: Upload all files
    console.log('📤 Uploading files to S3...');
    const uploadResult = await uploadDirectory(distDir);
    console.log(`📊 Upload complete: ${uploadResult.success}/${uploadResult.total} files uploaded successfully`);
    console.log('');
    
    // Step 3: Verify critical files
    console.log('🔍 Verifying critical files...');
    const indexExists = await verifyIndexHtml();
    console.log('');
    
    // Step 4: Invalidate CloudFront cache
    if (distributionId) {
      console.log('🔄 Invalidating CloudFront cache...');
      await invalidateCloudFront();
      console.log('');
    }
    
    // Step 5: Summary
    console.log('🎉 Deployment completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   • Files uploaded: ${uploadResult.success}/${uploadResult.total}`);
    console.log(`   • index.html in root: ${indexExists ? '✅' : '❌'}`);
    console.log(`   • CloudFront invalidation: ${distributionId ? '✅' : '⚠️  Not configured'}`);
    console.log('');
    console.log('🔗 Next steps:');
    console.log('   1. Wait for CloudFront invalidation to complete (usually 5-15 minutes)');
    console.log('   2. Test your CloudFront URL');
    console.log('   3. Verify all pages load correctly');
    
    if (!indexExists) {
      console.log('');
      console.log('⚠️  IMPORTANT: index.html is missing from bucket root!');
      console.log('   This will cause CloudFront to return 404 errors.');
      console.log('   Please check the upload process and try again.');
    }
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
deploy(); 