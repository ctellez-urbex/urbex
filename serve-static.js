const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

const OUT_DIR = path.join(__dirname, 'out');

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware para redirigir URLs sin trailing slash a con trailing slash (excepto archivos)
app.use((req, res, next) => {
  // Skip if it's a file with extension or already has trailing slash
  if (req.path !== '/' && !req.path.endsWith('/') && !path.extname(req.path)) {
    // Check if this path corresponds to a directory
    const dirPath = path.join(OUT_DIR, req.path);
    const indexPath = path.join(dirPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      return res.redirect(301, req.path + '/');
    }
  }
  next();
});

// Servir archivos estáticos desde el directorio 'out'
app.use(express.static(OUT_DIR, {
  extensions: ['html'], // Allow .html extension to be omitted
  index: 'index.html'
}));

// Manejar rutas SPA - buscar index.html en subdirectorios
app.get('*', (req, res) => {
  let filePath = path.join(OUT_DIR, req.path);
  
  // If path ends with /, look for index.html
  if (req.path.endsWith('/')) {
    filePath = path.join(filePath, 'index.html');
  }
  
  // Check if file exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }
  
  // Try with index.html appended
  const indexPath = path.join(filePath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  
  // Fallback to root index.html for client-side routing
  res.sendFile(path.join(OUT_DIR, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Servidor estático corriendo en http://localhost:${port}`);
  console.log(`📁 Sirviendo archivos desde: ${OUT_DIR}`);
  console.log(`\n🧪 Prueba estas URLs:`);
  console.log(`   http://localhost:${port}/`);
  console.log(`   http://localhost:${port}/dashboard/`);
  console.log(`   http://localhost:${port}/auth/login/`);
  console.log(`   http://localhost:${port}/properties/`);
  console.log(`   http://localhost:${port}/admin/users/`);
  console.log(`\n✨ Esto simula el comportamiento de S3 + CloudFront`);
}); 