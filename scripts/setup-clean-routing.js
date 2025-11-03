#!/usr/bin/env node

/**
 * Setup Clean Routing Script
 * 
 * Configura routing limpio para local, dev y prod siguiendo normas de S3
 * - URLs limpias sin index.html
 * - Compatibilidad con S3 static hosting
 * - Fallback a SPA routing
 */

const fs = require('fs');
const path = require('path');

// Configuración para diferentes entornos
const ENVIRONMENTS = {
  local: {
    name: 'Local Development',
    port: 3000,
    baseUrl: 'http://localhost:3000'
  },
  dev: {
    name: 'Development',
    port: 3001,
    baseUrl: 'http://localhost:3001'
  },
  prod: {
    name: 'Production (S3)',
    baseUrl: 'https://urbex.com.co'
  }
};

/**
 * Genera configuración de Next.js para routing limpio
 */
function generateNextConfig() {
  const config = `const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static export for S3 deployment
  distDir: 'out',
  trailingSlash: false, // URLs limpias sin trailing slash
  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
  
  // Configuración para manejar rutas en producción
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '/',
  basePath: '',
  
  // Optimizaciones de performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@aws-sdk/client-cognito-identity-provider'],
  },
  
  // Compresión de bundles
  compress: true,
  
  // Optimización de imágenes
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

module.exports = withBundleAnalyzer(nextConfig)`;

  return config;
}

/**
 * Genera configuración de Vercel para routing limpio
 */
function generateVercelConfig() {
  const config = {
    "cleanUrls": true,
    "trailingSlash": false,
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=0, must-revalidate"
          }
        ]
      },
      {
        "source": "/_next/static/(.*)",
        "headers": [
          {
            "key": "Cache-Control", 
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  };
  
  return config;
}

/**
 * Genera configuración de S3 para routing limpio
 */
function generateS3Config() {
  const config = {
    "IndexDocument": {
      "Suffix": "index.html"
    },
    "ErrorDocument": {
      "Key": "index.html"
    }
  };
  
  return config;
}

/**
 * Genera servidor de desarrollo con routing limpio
 */
function generateDevServer() {
  const server = `#!/usr/bin/env node

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
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
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
        console.log(\`📁 Serving directory index: \${requestedPath}/index.html\`);
        res.set('Cache-Control', 'no-cache, must-revalidate');
        return res.sendFile(indexPath);
      }
    } else {
      console.log(\`📄 Serving file: \${requestedPath}\`);
      return res.sendFile(filePath);
    }
  }
  
  // Buscar archivo HTML correspondiente
  const htmlPath = path.join(BUILD_DIR, requestedPath + '.html');
  if (fs.existsSync(htmlPath)) {
    console.log(\`🎯 Serving clean route: \${requestedPath} -> \${requestedPath}.html\`);
    res.set('Cache-Control', 'no-cache, must-revalidate');
    return res.sendFile(htmlPath);
  }
  
  // Buscar index.html en subdirectorio
  const subDirIndex = path.join(BUILD_DIR, requestedPath, 'index.html');
  if (fs.existsSync(subDirIndex)) {
    console.log(\`📂 Serving subdirectory: \${requestedPath}/index.html\`);
    res.set('Cache-Control', 'no-cache, must-revalidate');
    return res.sendFile(subDirIndex);
  }
  
  // Fallback a index.html principal (SPA routing)
  const fallbackPath = path.join(BUILD_DIR, 'index.html');
  if (fs.existsSync(fallbackPath)) {
    console.log(\`🔄 SPA fallback for: \${requestedPath}\`);
    res.set('Cache-Control', 'no-cache, must-revalidate');
    return res.sendFile(fallbackPath);
  }
  
  // 404 si nada funciona
  console.log(\`❌ 404 - Not found: \${requestedPath}\`);
  res.status(404).send('Page not found');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(\`🚀 Clean Routing Server running on http://localhost:\${PORT}\`);
  console.log(\`📁 Serving files from: \${BUILD_DIR}\`);
  console.log('');
  console.log('🧪 Test these clean URLs:');
  console.log(\`   http://localhost:\${PORT}/\`);
  console.log(\`   http://localhost:\${PORT}/dashboard\`);
  console.log(\`   http://localhost:\${PORT}/properties\`);
  console.log(\`   http://localhost:\${PORT}/auth/login\`);
  console.log('');
  console.log('✨ URLs limpias sin index.html - Compatible con S3');
  console.log('Press Ctrl+C to stop');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n👋 Shutting down clean routing server...');
  process.exit(0);
});`;

  return server;
}

/**
 * Función principal
 */
async function main() {
  console.log('🔧 Setting up clean routing for all environments...');
  
  try {
    // 1. Generar next.config.js
    console.log('📝 Generating next.config.js...');
    const nextConfig = generateNextConfig();
    fs.writeFileSync('next.config.js', nextConfig, 'utf8');
    console.log('✅ next.config.js updated');
    
    // 2. Generar vercel.json
    console.log('📝 Generating vercel.json...');
    const vercelConfig = generateVercelConfig();
    fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2), 'utf8');
    console.log('✅ vercel.json updated');
    
    // 3. Generar configuración de S3
    console.log('📝 Generating S3 configuration...');
    const s3Config = generateS3Config();
    fs.writeFileSync('s3-website-config.json', JSON.stringify(s3Config, null, 2), 'utf8');
    console.log('✅ s3-website-config.json created');
    
    // 4. Generar servidor de desarrollo
    console.log('📝 Generating development server...');
    const devServer = generateDevServer();
    fs.writeFileSync('scripts/clean-routing-server.js', devServer, 'utf8');
    fs.chmodSync('scripts/clean-routing-server.js', '755');
    console.log('✅ scripts/clean-routing-server.js created');
    
    console.log('\\n🎉 Clean routing setup completed!');
    console.log('\\n📋 Next steps:');
    console.log('1. npm run build - Build with clean routing');
    console.log('2. npm run serve:clean - Test clean routing locally');
    console.log('3. npm run deploy:s3 - Deploy to S3 with clean URLs');
    
    console.log('\\n🌐 Environment URLs:');
    Object.entries(ENVIRONMENTS).forEach(([key, env]) => {
      console.log('   ' + env.name + ': ' + env.baseUrl);
    });
    
  } catch (error) {
    console.error('❌ Error setting up clean routing:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  generateNextConfig,
  generateVercelConfig,
  generateS3Config,
  generateDevServer
};