const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();
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
  } catch (error) {
    console.error(`❌ Error uploading ${key}:`, error.message);
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
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Recursively upload subdirectories
      await uploadDirectory(fullPath, `${prefix}${item}/`);
    } else {
      // Upload file
      const key = `${prefix}${item}`;
      await uploadFile(fullPath, key);
    }
  }
}

// Main deployment function
async function deploy() {
  console.log('🚀 Starting deployment to S3...');
  console.log(`📦 Bucket: ${bucketName}`);
  console.log(`📁 Source: ${distDir}`);
  
  if (!fs.existsSync(distDir)) {
    console.error('❌ dist directory not found. Run npm run build:deploy first.');
    process.exit(1);
  }
  
  try {
    // Upload all files from dist directory
    await uploadDirectory(distDir);
    
    console.log('\n✅ Deployment completed successfully!');
    console.log('🔗 Your site should be available at your CloudFront URL');
    
    // Verify index.html was uploaded
    try {
      await s3.headObject({
        Bucket: bucketName,
        Key: 'index.html'
      }).promise();
      console.log('✅ index.html verified in S3 bucket root');
    } catch (error) {
      console.error('❌ index.html not found in S3 bucket root');
      console.error('Make sure to upload the index.html file to the root of your bucket');
    }
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
deploy(); 