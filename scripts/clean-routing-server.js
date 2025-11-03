#!/usr/bin/env node

/**
 * Clean Routing Development Server
 * Simula comportamiento de S3 con URLs limpias
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const BUILD_DIR = path.join(__dirname, '../out');

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Servir archivos estáticos
app.use('/_next', express.static(path.join(BUILD_DIR, '_next'), {
  maxAge: '1y',
  immutable: true
}));

app.use('/images', express.static(path.join(BUILD_DIR, 'images'), {
  maxAge: '1y'
}));

app.use('/favicon.ico', express.static(path.join(BUILD_DIR, 'favicon.ico')));
app.use('/manifest.json', express.static(path.join(BUILD_DIR, 'manifest.json')));
app.use('/robots.txt', express.static(path.join(BUILD_DIR, 'robots.txt')));
app.use('/sitemap.xml', express.static(path.join(BUILD_DIR, 'sitemap.xml')));
app.use('/env.js', express.static(path.join(BUILD_DIR, 'env.js'), {
  maxAge: 0,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-cache, must-revalidate');
  }
}));

// Manejar rutas SPA con URLs limpias
app.get('*', (req, res) => {
  const requestedPath = req.path;
  
  // Intentar servir archivo específico primero
  let filePath = path.join(BUILD_DIR, requestedPath);
  
  // Si es un directorio, buscar index.html dentro
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      if (fs.existsSync(indexPath)) {
        console.log(`📁 Serving directory index: ${requestedPath}/index.html`);
        res.set('Cache-Control', 'no-cache, must-revalidate');
        return res.sendFile(indexPath);
      }
    } else {
      console.log(`📄 Serving file: ${requestedPath}`);
      return res.sendFile(filePath);
    }
  }
  
  // Buscar archivo HTML correspondiente
  const htmlPath = path.join(BUILD_DIR, requestedPath + '.html');
  if (fs.existsSync(htmlPath)) {
    console.log(`🎯 Serving clean route: ${requestedPath} -> ${requestedPath}.html`);
    res.set('Cache-Control', 'no-cache, must-revalidate');
    return res.sendFile(htmlPath);
  }
  
  // Buscar index.html en subdirectorio
  const subDirIndex = path.join(BUILD_DIR, requestedPath, 'index.html');
  if (fs.existsSync(subDirIndex)) {
    console.log(`📂 Serving subdirectory: ${requestedPath}/index.html`);
    res.set('Cache-Control', 'no-cache, must-revalidate');
    return res.sendFile(subDirIndex);
  }
  
  // Fallback a index.html principal (SPA routing)
  const fallbackPath = path.join(BUILD_DIR, 'index.html');
  if (fs.existsSync(fallbackPath)) {
    console.log(`🔄 SPA fallback for: ${requestedPath}`);
    res.set('Cache-Control', 'no-cache, must-revalidate');
    return res.sendFile(fallbackPath);
  }
  
  // 404 si nada funciona
  console.log(`❌ 404 - Not found: ${requestedPath}`);
  res.status(404).send('Page not found');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Clean Routing Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${BUILD_DIR}`);
  console.log('');
  console.log('🧪 Test these clean URLs:');
  console.log(`   http://localhost:${PORT}/`);
  console.log(`   http://localhost:${PORT}/dashboard`);
  console.log(`   http://localhost:${PORT}/properties`);
  console.log(`   http://localhost:${PORT}/auth/login`);
  console.log('');
  console.log('✨ URLs limpias sin index.html - Compatible con S3');
  console.log('Press Ctrl+C to stop');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down clean routing server...');
  process.exit(0);
});