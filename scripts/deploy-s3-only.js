#!/usr/bin/env node

/**
 * Simple S3-Only Deployment Script
 * 
 * For testing S3 without CloudFront
 * 
 * Usage:
 *   node scripts/deploy-s3-only.js
 */

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME;

if (!bucketName) {
  console.error('❌ S3_BUCKET_NAME environment variable is required');
  process.exit(1);
}

const buildDir = path.join(__dirname, '..', 'out');

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

// Function to create S3 bucket if it doesn't exist
async function createBucketIfNeeded() {
  const region = process.env.AWS_REGION || 'us-east-2';
  
  try {
    // Check if bucket exists
    await s3.headBucket({ Bucket: bucketName }).promise();
    console.log(`✅ S3 bucket '${bucketName}' already exists`);
    return false; // Bucket already exists
  } catch (error) {
    if (error.code === 'NotFound' || error.code === '404') {
      console.log(`📦 Bucket '${bucketName}' not found. Creating it...`);
      
      try {
        const params = {
          Bucket: bucketName,
          CreateBucketConfiguration: {
            LocationConstraint: region === 'us-east-1' ? undefined : region
          }
        };
        
        // us-east-1 doesn't need LocationConstraint
        if (region === 'us-east-1') {
          delete params.CreateBucketConfiguration;
        }
        
        await s3.createBucket(params).promise();
        console.log(`✅ Bucket '${bucketName}' created successfully in region '${region}'`);
        
        // Wait a bit for bucket to be ready
        console.log('⏳ Waiting for bucket to be ready...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return true; // Bucket was created
      } catch (createError) {
        if (createError.code === 'BucketAlreadyExists') {
          console.log(`✅ Bucket '${bucketName}' exists (created by another process)`);
          return false;
        }
        console.error(`❌ Error creating bucket: ${createError.message}`);
        throw createError;
      }
    } else {
      // Different error (permissions, etc.)
      console.error(`❌ Error checking bucket: ${error.message}`);
      throw error;
    }
  }
}

// Function to verify S3 bucket configuration
async function verifyBucketConfig() {
  try {
    // Check if bucket exists and is accessible
    await s3.headBucket({ Bucket: bucketName }).promise();
    console.log(`✅ S3 bucket '${bucketName}' is accessible`);
    
    // Check if bucket is configured as website
    try {
      const website = await s3.getBucketWebsite({ Bucket: bucketName }).promise();
      console.log('✅ Bucket website configuration found');
      const region = process.env.AWS_REGION || 'us-east-2';
      console.log(`🌐 Website URL: http://${bucketName}.s3-website-${region}.amazonaws.com`);
    } catch (error) {
      if (error.code === 'NoSuchWebsiteConfiguration') {
        console.log('⚠️  No website configuration found');
        console.log('💡 To access via HTTP, configure bucket as website:');
        console.log(`   aws s3 website s3://${bucketName} --index-document index.html --error-document 404.html`);
      } else {
        console.log(`⚠️  Could not check website configuration: ${error.message}`);
      }
    }
    
  } catch (error) {
    if (error.code === 'NotFound' || error.code === '404') {
      console.error(`❌ S3 bucket '${bucketName}' does not exist`);
      console.error('💡 The bucket should have been created automatically. Please check:');
      console.error('   1. Your AWS credentials have permissions to create buckets');
      console.error('   2. The bucket name is available (must be globally unique)');
      console.error('   3. The region is correct');
    } else {
      console.error(`❌ Error accessing S3 bucket '${bucketName}':`, error.message);
    }
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
    return false;
  }
}

// Main deployment function
async function deployToS3() {
  console.log('🚀 Starting S3-only deployment...');
  console.log(`📦 Bucket: ${bucketName}`);
  console.log(`📁 Source: ${buildDir}`);
  console.log('');
  
  // Next.js static export generates files directly in out/
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found. Run npm run build first.');
    process.exit(1);
  }
  
  try {
    // Step 1: Create bucket if needed
    console.log('🔍 Checking if bucket exists...');
    const wasCreated = await createBucketIfNeeded();
    console.log('');
    
    // Step 2: Verify bucket configuration
    console.log('🔍 Verifying S3 bucket configuration...');
    await verifyBucketConfig();
    console.log('');
    
    // Step 3: Upload all files
    console.log('📤 Uploading files to S3...');
    const uploadResult = await uploadDirectory(buildDir);
    console.log(`📊 Upload complete: ${uploadResult.success}/${uploadResult.total} files uploaded successfully`);
    console.log('');
    
    // Step 4: Verify critical files
    console.log('🔍 Verifying critical files...');
    const indexExists = await verifyIndexHtml();
    console.log('');
    
    if (indexExists) {
      console.log('✅ S3 deployment completed successfully!');
      console.log('');
      console.log('🌐 Access your site:');
      const region = process.env.AWS_REGION || 'us-east-2';
      console.log(`   Direct S3: https://${bucketName}.s3.${region}.amazonaws.com/index.html`);
      console.log(`   Website URL: http://${bucketName}.s3-website-${region}.amazonaws.com`);
      console.log('');
      console.log('💡 Note: Website URL requires bucket to be configured as website');
      console.log('   Run: aws s3 website s3://' + bucketName + ' --index-document index.html --error-document 404.html');
      console.log('');
      console.log('🧪 Test URLs:');
      console.log(`   ${bucketName}.s3-website-${region}.amazonaws.com/`);
      console.log(`   ${bucketName}.s3-website-${region}.amazonaws.com/dashboard`);
      console.log(`   ${bucketName}.s3-website-${region}.amazonaws.com/properties`);
    } else {
      console.log('⚠️  S3 deployment completed with warnings');
    }
    
  } catch (error) {
    console.error('❌ S3 deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
deployToS3(); 