const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Servir archivos estáticos desde el directorio 'out'
app.use(express.static(path.join(__dirname, 'out')));

// Manejar todas las rutas para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'out', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Servidor estático corriendo en http://localhost:${port}`);
  console.log(`📁 Sirviendo archivos desde: ${path.join(__dirname, 'out')}`);
}); 