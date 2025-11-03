#!/usr/bin/env node

/**
 * Test Property Detail Integration
 * 
 * Script para probar la integración entre properties y detail_property
 */

const { encryptBarmanpre, decryptBarmanpre } = require('./src/lib/encryption.ts');

// Datos de prueba similares a los que se generarían desde properties
const testPropertyData = {
  id: 'test_property_123',
  address: 'Calle 123 #45-67, Bogotá',
  estrato: 4,
  area: 120,
  bedrooms: 3,
  bathrooms: 2,
  floors: 1,
  yearBuilt: {
    min: 2010,
    max: 2015
  },
  coordinates: {
    lat: 4.6097,
    lng: -74.0817
  },
  barmanpre: 'TEST123456789'
};

console.log('🏠 Datos de la propiedad de prueba:');
console.log(JSON.stringify(testPropertyData, null, 2));

console.log('\n🔐 Encriptando datos...');
const encryptedToken = encryptBarmanpre(JSON.stringify(testPropertyData));
console.log('Token encriptado:', encryptedToken);

console.log('\n🔓 Desencriptando para verificar...');
const decryptedString = decryptBarmanpre(encryptedToken);
const decryptedData = JSON.parse(decryptedString);
console.log('Datos desencriptados:');
console.log(JSON.stringify(decryptedData, null, 2));

console.log('\n✅ Verificación:', JSON.stringify(testPropertyData) === JSON.stringify(decryptedData) ? 'EXITOSA' : 'FALLIDA');

const encodedToken = encodeURIComponent(encryptedToken);
const testUrl = `http://localhost:3001/detail_property?token=${encodedToken}`;

console.log('\n🌐 URL de prueba:');
console.log(testUrl);

console.log('\n📋 Instrucciones:');
console.log('1. Asegúrate de que el servidor esté ejecutándose: npm run serve:clean');
console.log('2. Abre la URL en tu navegador');
console.log('3. Verifica que se muestren todos los datos de la propiedad');
console.log('4. Comprueba que se ejecuten las 3 APIs (Details, Analysis, Market Study)');

console.log('\n🧪 También puedes probar desde properties:');
console.log('1. Ve a http://localhost:3001/properties');
console.log('2. Realiza una búsqueda');
console.log('3. Selecciona una propiedad');
console.log('4. Haz clic en "Ver Detalles"');
console.log('5. Debería abrir una nueva ventana con detail_property');
