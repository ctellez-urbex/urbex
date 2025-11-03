#!/usr/bin/env node

/**
 * Test SPA Routing Server
 * 
 * This server simulates S3 + CloudFront behavior for testing routing
 * It serves static files and falls back to index.html for SPA routes
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const BUILD_DIR = path.join(__dirname, '../out');

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files with proper cache headers
app.use('/_next', express.static(path.join(BUILD_DIR, '_next'), {
  maxAge: '1y',
  immutable: true
}));

// Serve other static assets
app.use('/images', express.static(path.join(BUILD_DIR, 'images'), {
  maxAge: '1y'
}));

app.use('/favicon.ico', express.static(path.join(BUILD_DIR, 'favicon.ico'), {
  maxAge: '1y'
}));

app.use('/manifest.json', express.static(path.join(BUILD_DIR, 'manifest.json'), {
  maxAge: '1d'
}));

app.use('/robots.txt', express.static(path.join(BUILD_DIR, 'robots.txt'), {
  maxAge: '1d'
}));

app.use('/sitemap.xml', express.static(path.join(BUILD_DIR, 'sitemap.xml'), {
  maxAge: '1d'
}));

app.use('/env.js', express.static(path.join(BUILD_DIR, 'env.js'), {
  maxAge: 0,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-cache, must-revalidate');
  }
}));

// Handle SPA routes - this is the key part that fixes routing
app.get('*', (req, res) => {
  const requestedPath = req.path;
  
  // Try to serve the exact file first
  const exactFilePath = path.join(BUILD_DIR, requestedPath);
  
  // If it's a directory, try index.html inside it
  if (fs.existsSync(exactFilePath)) {
    const stats = fs.statSync(exactFilePath);
    if (stats.isDirectory()) {
      const indexPath = path.join(exactFilePath, 'index.html');
      if (fs.existsSync(indexPath)) {
        console.log(`📁 Serving directory index: ${indexPath}`);
        return res.sendFile(indexPath);
      }
    } else {
      console.log(`📄 Serving exact file: ${exactFilePath}`);
      return res.sendFile(exactFilePath);
    }
  }
  
  // If no exact match, check if there's an HTML file for this route
  const htmlFilePath = path.join(BUILD_DIR, requestedPath, 'index.html');
  if (fs.existsSync(htmlFilePath)) {
    console.log(`🎯 Serving SPA route: ${htmlFilePath}`);
    res.set('Cache-Control', 'no-cache, must-revalidate');
    return res.sendFile(htmlFilePath);
  }
  
  // Fallback to root index.html for SPA routing (this simulates CloudFront error pages)
  const fallbackPath = path.join(BUILD_DIR, 'index.html');
  if (fs.existsSync(fallbackPath)) {
    console.log(`🔄 SPA fallback to root index.html for: ${requestedPath}`);
    res.set('Cache-Control', 'no-cache, must-revalidate');
    return res.sendFile(fallbackPath);
  }
  
  // If even the fallback doesn't exist, return 404
  console.log(`❌ 404 - File not found: ${requestedPath}`);
  res.status(404).send('File not found');
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 SPA Test Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${BUILD_DIR}`);
  console.log('');
  console.log('🧪 Test these URLs:');
  console.log(`   http://localhost:${PORT}/`);
  console.log(`   http://localhost:${PORT}/dashboard`);
  console.log(`   http://localhost:${PORT}/auth/login`);
  console.log(`   http://localhost:${PORT}/properties`);
  console.log(`   http://localhost:${PORT}/admin/users`);
  console.log('');
  console.log('✨ This simulates S3 + CloudFront with proper SPA routing');
  console.log('Press Ctrl+C to stop');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down SPA test server...');
  process.exit(0);
});
