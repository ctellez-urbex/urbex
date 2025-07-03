const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', '.next');
const distDir = path.join(__dirname, '..', 'dist');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy static files
function copyStaticFiles() {
  const staticDir = path.join(sourceDir, 'static');
  const distStaticDir = path.join(distDir, '_next', 'static');
  
  if (fs.existsSync(staticDir)) {
    if (!fs.existsSync(distStaticDir)) {
      fs.mkdirSync(distStaticDir, { recursive: true });
    }
    
    // Copy static directory recursively
    copyDirectory(staticDir, distStaticDir);
    console.log('✅ Static files copied');
  }
}

// Copy public files
function copyPublicFiles() {
  const publicDir = path.join(__dirname, '..', 'public');
  if (fs.existsSync(publicDir)) {
    copyDirectory(publicDir, distDir);
    console.log('✅ Public files copied');
  }
}

// Copy index.html to root
function copyIndexHtml() {
  const indexPath = path.join(sourceDir, 'index.html');
  const distIndexPath = path.join(distDir, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, distIndexPath);
    console.log('✅ index.html copied to root');
  }
}

// Copy server files for static pages
function copyServerFiles() {
  const serverDir = path.join(sourceDir, 'server', 'app');
  const distServerDir = path.join(distDir, 'server', 'app');
  
  if (fs.existsSync(serverDir)) {
    if (!fs.existsSync(distServerDir)) {
      fs.mkdirSync(distServerDir, { recursive: true });
    }
    
    // Copy only the page.js files for static pages
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

// Helper function to copy directory recursively
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

// Create a simple deployment guide
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

// Main execution
console.log('🚀 Preparing files for deployment...');

try {
  copyStaticFiles();
  copyPublicFiles();
  copyIndexHtml();
  copyServerFiles();
  createDeploymentGuide();
  
  console.log('\n✅ Deployment preparation completed!');
  console.log(`📁 Files ready in: ${distDir}`);
  console.log('📋 Upload all files from the dist folder to your S3 bucket');
  console.log('🔗 Make sure index.html is in the root of the bucket');
  
} catch (error) {
  console.error('❌ Error preparing deployment:', error);
  process.exit(1);
} 