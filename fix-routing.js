const { execSync } = require('child_process');

console.log('🔧 Fixing CloudFront routing issues...\n');

try {
  // 1. Configure S3 website hosting with proper index and error documents
  console.log('📦 Configuring S3 website hosting...');
  execSync('aws s3 website s3://frontend-urbex --index-document index.html --error-document 404.html', { stdio: 'inherit' });
  
  // 2. Get CloudFront distribution ID
  console.log('\n☁️ Getting CloudFront distribution ID...');
  const cfOutput = execSync('aws cloudfront list-distributions --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, \'frontend-urbex\')].Id" --output text', { encoding: 'utf8' });
  const distributionId = cfOutput.trim();
  
  if (!distributionId) {
    throw new Error('No CloudFront distribution found for frontend-urbex');
  }
  
  console.log(`✅ Found distribution: ${distributionId}`);
  
  // 3. Create CloudFront invalidation
  console.log('\n🔄 Creating CloudFront invalidation...');
  execSync(`aws cloudfront create-invalidation --distribution-id ${distributionId} --paths "/*"`, { stdio: 'inherit' });
  
  console.log('\n✅ Configuration completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Go to AWS Console > CloudFront');
  console.log(`2. Select distribution: ${distributionId}`);
  console.log('3. Go to "Error Pages" tab');
  console.log('4. Create custom error responses:');
  console.log('   - 404 → 200 → /index.html');
  console.log('   - 403 → 200 → /index.html');
  console.log('\n🌐 Test URLs:');
  console.log('- https://d2i14zgn3xm1xu.cloudfront.net/auth/login/');
  console.log('- https://d2i14zgn3xm1xu.cloudfront.net/dashboard/');
  console.log('- https://d2i14zgn3xm1xu.cloudfront.net/admin/users/');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n💡 Manual steps:');
  console.log('1. Go to AWS Console > CloudFront');
  console.log('2. Find your distribution (d2i14zgn3xm1xu.cloudfront.net)');
  console.log('3. Go to "Error Pages" tab');
  console.log('4. Create custom error response:');
  console.log('   - Error Code: 404');
  console.log('   - Response Code: 200');
  console.log('   - Response Page Path: /index.html');
} 