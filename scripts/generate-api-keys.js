#!/usr/bin/env node

/**
 * Script para generar API keys seguras
 * 
 * Uso:
 *   node scripts/generate-api-keys.js
 *   node scripts/generate-api-keys.js --env=production
 *   node scripts/generate-api-keys.js --count=5
 */

const crypto = require('crypto');

// Configuración
const DEFAULT_COUNT = 3;
const KEY_LENGTH = 32; // bytes
const KEY_TYPES = ['API_KEY', 'ADMIN_API_KEY', 'PUBLIC_API_KEY'];

/**
 * Genera una API key segura
 * 
 * @param {string} prefix - Prefijo para identificar el tipo de clave
 * @returns {string} API key generada
 */
function generateApiKey(prefix = '') {
  const randomBytes = crypto.randomBytes(KEY_LENGTH);
  const key = randomBytes.toString('hex');
  return prefix ? `${prefix}_${key}` : key;
}

/**
 * Genera múltiples API keys
 * 
 * @param {number} count - Número de claves a generar
 * @param {string} env - Entorno (dev, staging, prod)
 * @returns {Object} Objeto con las claves generadas
 */
function generateApiKeys(count = DEFAULT_COUNT, env = 'dev') {
  const keys = {};
  
  for (let i = 0; i < count; i++) {
    const keyType = KEY_TYPES[i] || `CUSTOM_KEY_${i + 1}`;
    const prefix = env.toUpperCase();
    keys[keyType] = generateApiKey(prefix);
  }
  
  return keys;
}

/**
 * Formatea las claves para variables de entorno
 * 
 * @param {Object} keys - Objeto con las claves
 * @returns {string} String formateado para .env
 */
function formatForEnv(keys) {
  let output = '# API Keys Configuration\n';
  output += '# =====================\n\n';
  
  Object.entries(keys).forEach(([key, value]) => {
    output += `# ${key} - ${getKeyDescription(key)}\n`;
    output += `${key}=${value}\n\n`;
  });
  
  return output;
}

/**
 * Obtiene la descripción de un tipo de clave
 * 
 * @param {string} keyType - Tipo de clave
 * @returns {string} Descripción
 */
function getKeyDescription(keyType) {
  const descriptions = {
    'API_KEY': 'API Key principal para acceso general a las APIs',
    'ADMIN_API_KEY': 'API Key de administrador para endpoints administrativos',
    'PUBLIC_API_KEY': 'API Key pública para endpoints públicos (opcional)'
  };
  
  return descriptions[keyType] || 'API Key personalizada';
}

/**
 * Muestra las claves en formato de tabla
 * 
 * @param {Object} keys - Objeto con las claves
 */
function displayKeys(keys) {
  console.log('\n🔐 API Keys Generadas:\n');
  console.log('┌─────────────────────┬─────────────────────────────────────────────────────────────┐');
  console.log('│ Tipo de Clave       │ Valor                                                        │');
  console.log('├─────────────────────┼─────────────────────────────────────────────────────────────┤');
  
  Object.entries(keys).forEach(([key, value]) => {
    const keyPadded = key.padEnd(19);
    const valuePadded = value.padEnd(67);
    console.log(`│ ${keyPadded} │ ${valuePadded} │`);
  });
  
  console.log('└─────────────────────┴─────────────────────────────────────────────────────────────┘');
}

/**
 * Función principal
 */
function main() {
  // Parsear argumentos de línea de comandos
  const args = process.argv.slice(2);
  const envArg = args.find(arg => arg.startsWith('--env='));
  const countArg = args.find(arg => arg.startsWith('--count='));
  
  const env = envArg ? envArg.split('=')[1] : 'dev';
  const count = countArg ? parseInt(countArg.split('=')[1]) : DEFAULT_COUNT;
  
  console.log(`🚀 Generando ${count} API keys para entorno: ${env.toUpperCase()}\n`);
  
  // Generar claves
  const keys = generateApiKeys(count, env);
  
  // Mostrar claves
  displayKeys(keys);
  
  // Mostrar formato para .env
  console.log('\n📝 Formato para archivo .env:\n');
  console.log(formatForEnv(keys));
  
  // Instrucciones
  console.log('📋 Instrucciones:');
  console.log('1. Copia las variables de entorno a tu archivo .env.local');
  console.log('2. Nunca commits las API keys al repositorio');
  console.log('3. Usa claves diferentes para cada entorno (dev, staging, prod)');
  console.log('4. Rota las claves regularmente por seguridad');
  console.log('\n🔒 Seguridad:');
  console.log('- Las claves generadas son criptográficamente seguras');
  console.log('- Cada clave tiene 64 caracteres hexadecimales');
  console.log('- Usa HTTPS en producción');
  console.log('- Limita el acceso por IP si es posible');
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = {
  generateApiKey,
  generateApiKeys,
  formatForEnv
}; 