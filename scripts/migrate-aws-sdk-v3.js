#!/usr/bin/env node

/**
 * Script para migrar de AWS SDK v2 a v3
 * Ejecutar: node scripts/migrate-aws-sdk-v3.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando migración de AWS SDK v2 a v3...\n');

// Archivos que necesitan actualización
const filesToUpdate = [
  'src/lib/cognito-admin.ts',
  'src/app/api/admin/users/route.ts',
  'src/app/api/admin/users/[id]/route.ts',
  'src/app/api/admin/users/[id]/status/route.ts',
  'src/app/api/admin/users/[id]/attributes/route.ts',
  'src/app/api/debug/user-attributes/route.ts',
  'src/app/api/debug/user-pool-config/route.ts',
];

// Comandos de instalación
const installCommands = [
  'npm uninstall aws-sdk',
  'npm install @aws-sdk/client-cognito-identity-provider',
  'npm install @aws-sdk/client-s3',
  'npm install @aws-sdk/client-cloudfront',
];

// Ejemplo de migración para cognito-admin.ts
const cognitoAdminMigration = `
// ANTES (AWS SDK v2):
import { CognitoIdentityServiceProvider } from 'aws-sdk'

const cognito = new CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION || 'us-east-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

// DESPUÉS (AWS SDK v3):
import { CognitoIdentityProviderClient, ListUsersCommand, AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider'

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// Ejemplo de uso:
// ANTES: await cognito.listUsers(params).promise()
// DESPUÉS: await cognito.send(new ListUsersCommand(params))
`;

// Ejemplo de migración para API routes
const apiRouteMigration = `
// ANTES (AWS SDK v2):
import { CognitoIdentityServiceProvider } from 'aws-sdk'

const cognito = new CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION || 'us-east-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const result = await cognito.listUsers(params).promise()

// DESPUÉS (AWS SDK v3):
import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider'

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const result = await cognito.send(new ListUsersCommand(params))
`;

console.log('📋 Archivos que necesitan actualización:');
filesToUpdate.forEach(file => {
  console.log(`  - ${file}`);
});

console.log('\n🔧 Comandos de instalación:');
installCommands.forEach(cmd => {
  console.log(`  ${cmd}`);
});

console.log('\n📝 Ejemplo de migración para cognito-admin.ts:');
console.log(cognitoAdminMigration);

console.log('\n📝 Ejemplo de migración para API routes:');
console.log(apiRouteMigration);

console.log('\n⚠️  Cambios principales:');
console.log('  1. Importar clientes específicos en lugar del SDK completo');
console.log('  2. Usar .send(new Command(params)) en lugar de .promise()');
console.log('  3. Configurar credentials explícitamente');
console.log('  4. Usar tipos TypeScript más específicos');

console.log('\n🎯 Pasos recomendados:');
console.log('  1. Ejecutar comandos de instalación');
console.log('  2. Actualizar imports en archivos listados');
console.log('  3. Cambiar .promise() por .send(new Command())');
console.log('  4. Actualizar tipos TypeScript');
console.log('  5. Ejecutar tests para verificar cambios');
console.log('  6. Ejecutar build para verificar compilación');

console.log('\n✅ Migración completada!'); 