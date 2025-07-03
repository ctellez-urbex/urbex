const fs = require('fs');
const path = require('path');

// Read the built page content
const outDir = path.join(__dirname, '..', '.next', 'server', 'app');
const pagePath = path.join(outDir, 'page.js');

if (!fs.existsSync(pagePath)) {
  console.error('Page file not found. Run npm run build first.');
  process.exit(1);
}

// Create a simple index.html that redirects to the landing page
const indexHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Urbex - Información Inmobiliaria</title>
    <meta name="description" content="Plataforma especializada en información inmobiliaria que te permite acceder a toda la información de cualquier propiedad o lote de forma fácil y rápida.">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://urbex.com.co/">
    
    <!-- Preload critical resources -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Favicon -->
    <link rel="icon" href="/favicon.ico">
    
    <!-- Open Graph -->
    <meta property="og:title" content="Urbex - Información Inmobiliaria">
    <meta property="og:description" content="Plataforma especializada en información inmobiliaria en Colombia">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://urbex.com.co">
    <meta property="og:image" content="https://urbex.com.co/images/og-image.jpg">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Urbex - Información Inmobiliaria">
    <meta name="twitter:description" content="Plataforma especializada en información inmobiliaria en Colombia">
    <meta name="twitter:image" content="https://urbex.com.co/images/og-image.jpg">
    
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .loading {
            text-align: center;
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        h1 {
            margin: 0 0 10px 0;
            font-size: 2rem;
            font-weight: 700;
        }
        p {
            margin: 0;
            opacity: 0.9;
            font-size: 1.1rem;
        }
    </style>
</head>
<body>
    <div class="loading">
        <div class="spinner"></div>
        <h1>Urbex</h1>
        <p>Cargando información inmobiliaria...</p>
    </div>
    
    <script>
        // Redirect to the main application
        window.location.href = '/';
    </script>
</body>
</html>`;

// Write the index.html to the out directory
const outPath = path.join(__dirname, '..', '.next', 'index.html');
fs.writeFileSync(outPath, indexHtml);

console.log('✅ index.html generated successfully at:', outPath);
console.log('📁 This file should be uploaded to your S3 bucket root for CloudFront compatibility'); 