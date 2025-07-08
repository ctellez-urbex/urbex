# Urbex - Plataforma de Análisis Inmobiliario

![Urbex Logo](./public/images/urbex-logo.svg)

Urbex es una plataforma moderna de análisis inmobiliario que utiliza inteligencia artificial para proporcionar insights detallados sobre propiedades y lotes.

## 🚀 Características

- **Análisis de Mercado**: Información detallada sobre propiedades y lotes
- **Diseño Responsivo**: Optimizado para todos los dispositivos
- **Tema Claro/Oscuro**: Adaptación automática al tema del sistema
- **Carrusel de Imágenes**: Presentación dinámica de propiedades
- **Sección de Servicios**: Descripción detallada de nuestros servicios
- **Equipo**: Presentación de nuestro equipo de expertos
- **Formulario de Contacto**: Comunicación directa con los usuarios
- **Autenticación**: Sistema de login/registro con AWS Cognito
- **Recuperación de Contraseña**: Sistema completo con Mailgun
- **Dashboard**: Panel de control personalizado
- **Administración de Usuarios**: Gestión completa de usuarios registrados

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Gestión de Estado**: React Hooks
- **Autenticación**: AWS Cognito (SDK v3)
- **Email**: Mailgun para notificaciones
- **Despliegue**: AWS S3 + CloudFront

## 📁 Estructura del Proyecto

```
src/
  ├── app/
  │   ├── auth/                    # Páginas de autenticación
  │   │   ├── login/               # Página de login
  │   │   ├── register/            # Página de registro
  │   │   ├── forgot-password/     # Recuperación de contraseña
  │   │   └── verify-email/        # Verificación de email
  │   ├── dashboard/               # Dashboard principal
  │   ├── admin/                   # Módulo de administración
  │   │   └── users/               # Administración de usuarios
  │   └── api/                     # API routes
  │       ├── auth/                # APIs de autenticación
  │       │   ├── forgot-password/ # API para solicitar reset
  │       │   └── reset-password/  # API para confirmar reset
  │       └── admin/               # APIs de administración
  ├── components/
  │   ├── admin/                   # Componentes de administración
  │   │   ├── UserList.tsx         # Lista de usuarios
  │   │   ├── UserFilters.tsx      # Filtros de búsqueda
  │   │   ├── UserStats.tsx        # Estadísticas
  │   │   └── UserEditModal.tsx    # Modal de edición
  │   ├── auth/                    # Componentes de autenticación
  │   ├── layout/                  # Componentes de layout
  │   └── ui/                      # Componentes UI base
  ├── contexts/                    # Contextos de React
  ├── types/                       # Tipos TypeScript
  ├── lib/
  │   ├── auth/                    # Servicios de autenticación
  │   │   └── password-reset.ts    # Servicio de reset de contraseña
  │   └── aws/                     # Servicios de AWS
  ├── features/
  │   └── landing/                 # Componentes del landing
  └── styles/
```

## 🧩 Componentes Principales

### Landing Page
- **Hero**: Carrusel de imágenes con transiciones suaves
- **Services**: Presentación de servicios con iconos SVG
- **Team**: Presentación del equipo con imágenes circulares
- **Clients**: Carrusel infinito de logos de clientes
- **Contact**: Formulario de contacto completo

### Autenticación
- **LoginForm**: Formulario de inicio de sesión
- **SignUpForm**: Formulario de registro
- **ForgotPasswordForm**: Formulario de recuperación de contraseña
- **AuthContext**: Gestión de estado de autenticación
- **ProtectedRoute**: Protección de rutas privadas

### Dashboard
- **DashboardPage**: Panel principal con información del usuario
- **UserInfo**: Tarjeta con información del usuario
- **QuickActions**: Acciones rápidas disponibles

### Dashboard - Datos del Usuario
El dashboard ahora integra datos completos del usuario desde AWS Cognito:

#### Campos Mostrados
- **Email**: Dirección de correo electrónico del usuario
- **Nombre**: Campo `first_name` de Cognito
- **Apellido**: Campo `last_name` de Cognito  
- **SU (Custom)**: Campo personalizado `custom:su` de Cognito
- **Plan**: Campo personalizado `custom:plan` de Cognito

#### Funcionalidades
- **Carga Automática**: Los datos se cargan automáticamente al iniciar sesión
- **Botón de Actualización**: Permite refrescar los datos desde Cognito en tiempo real
- **Fallback**: Si no se pueden obtener los datos de Cognito, usa datos locales
- **Interfaz Responsiva**: Diseño adaptativo para diferentes tamaños de pantalla

#### Integración Técnica
- **AuthContext**: Gestiona el estado del usuario con todos los campos de Cognito
- **Cognito Service**: Función `getUserAttributes()` para obtener atributos del usuario
- **Persistencia**: Los datos se guardan en localStorage como respaldo
- **Actualización en Tiempo Real**: Función `refreshUserData()` para actualizar datos

### Administración de Usuarios
- **UserList**: Tabla de usuarios con paginación y filtros
- **UserFilters**: Filtros avanzados de búsqueda
- **UserStats**: Estadísticas en tiempo real
- **UserEditModal**: Modal para editar información de usuarios

## 🔐 Sistema de Autenticación

### Características
- **AWS Cognito**: Autenticación segura y escalable
- **API Key Authentication**: Autenticación por API key para todas las APIs
- **SPA Routing**: Navegación fluida sin recargas
- **Protección de Rutas**: Acceso controlado a páginas privadas
- **Persistencia de Sesión**: Mantiene el estado de login
- **Redirección Automática**: Navegación inteligente según estado
- **Recuperación de Contraseña**: Sistema completo con Mailgun

## 🌐 APIs Externas

### Configuración para S3 + CloudFront
El frontend está desplegado en **S3 + CloudFront** (contenido estático) y se comunica con **APIs externas**. Las variables de entorno se manejan a través de un archivo de configuración estático.

### Configuración

#### **1. Generar Configuración**
```bash
# Para producción
npm run env:generate -- --env=production

# Para staging
npm run env:generate -- --env=staging

# Para desarrollo
npm run env:generate -- --env=development
```

#### **2. Editar Archivo de Configuración**
Edita `/public/env.js` con tus valores reales:

```javascript
// /public/env.js
window.ENV = {
  // API Externa Configuration
  NEXT_PUBLIC_API_BASE_URL: 'https://api.urbex.com.co',
  NEXT_PUBLIC_API_KEY: 'tu_api_key_real_aqui',
  
  // AWS Configuration
  NEXT_PUBLIC_AWS_REGION: 'us-east-2',
  NEXT_PUBLIC_AWS_USER_POOL_ID: 'us-east-2_Fpda5LMX0',
  NEXT_PUBLIC_AWS_POOL_CLIENT_ID: 'tu_cognito_client_id_real',
  
  // Application Configuration
  NEXT_PUBLIC_APP_NAME: 'Urbex',
  NEXT_PUBLIC_APP_URL: 'https://urbex.com.co',
  
  // Environment
  NODE_ENV: 'production'
};
```

### Scripts Disponibles

```bash
# Generar configuración de entorno
npm run env:generate -- --env=production

# Build con configuración automática
npm run build:dev      # development
npm run build:staging  # staging
npm run build          # production
```

### Verificación

Abre las **Developer Tools** (F12) y revisa la **Console**:
```javascript
// Deberías ver:
🔗 API Configuration: {baseUrl: "https://api.urbex.com.co", hasApiKey: true, ...}
```

Para más detalles, consulta [docs/s3-static-env-setup.md](docs/s3-static-env-setup.md).

### API Key Authentication
El sistema implementa autenticación por API key para proteger todas las rutas de API:

#### Niveles de Acceso
- **API_KEY**: Acceso general a la mayoría de endpoints
- **ADMIN_API_KEY**: Funciones administrativas y de gestión
- **PUBLIC_API_KEY**: Endpoints públicos (opcional)

#### Implementación
- **Middleware Automático**: Validación automática en todas las rutas `/api/*`
- **Headers**: API key enviada en header `x-api-key`
- **Query Parameters**: Soporte opcional para parámetros de query
- **Logging**: Registro automático de peticiones y errores de autenticación

#### Configuración
```bash
# Variables de entorno requeridas
API_KEY=your_main_api_key_here
ADMIN_API_KEY=your_admin_api_key_here
PUBLIC_API_KEY=your_public_api_key_here
```

Para más detalles, consulta [docs/api-key-setup.md](docs/api-key-setup.md).

### Flujo de Autenticación
1. Usuario accede a `/auth/login`
2. Ingresa credenciales
3. Se valida con AWS Cognito
4. Se redirige automáticamente al dashboard
5. Las rutas protegidas verifican el estado de autenticación

### Manejo de Errores de Autenticación
El sistema maneja específicamente los siguientes errores de Cognito:

#### Errores de Login
- **Usuario Deshabilitado**: `"Tu cuenta está deshabilitada. Contacta al administrador para habilitarla."`
- **Credenciales Incorrectas**: `"Email o contraseña incorrectos. ¿Ya te registraste y confirmaste tu email?"`
- **Usuario No Confirmado**: `"Debes confirmar tu email antes de iniciar sesión. Revisa tu correo."`
- **Usuario No Existe**: `"No existe una cuenta con este email. Regístrate primero."`
- **Demasiados Intentos**: `"Demasiados intentos de login. Espera unos minutos antes de intentar de nuevo."`

#### Experiencia de Usuario
- **Mensajes Claros**: Errores traducidos y amigables
- **Información de Contacto**: Enlace directo al administrador para cuentas deshabilitadas
- **Limpieza Automática**: Los errores se limpian al escribir
- **Estados Visuales**: Indicadores de carga y error claros

### Flujo de Recuperación de Contraseña
1. **Solicitud**: Usuario ingresa su email en `/auth/forgot-password`
2. **Validación**: Verificación de usuario confirmado en Cognito
3. **Generación**: Código de 6 dígitos único y seguro
4. **Envío**: Email personalizado via Mailgun con código
5. **Verificación**: Validación del código ingresado
6. **Actualización**: Cambio de contraseña en Cognito

### Características del Sistema de Password Reset
- **Códigos de 6 dígitos**: Generación aleatoria segura
- **Expiración**: 15 minutos de validez
- **Reenvío**: Cooldown de 60 segundos
- **Validación**: Verificación de email confirmado
- **Seguridad**: Limpieza automática de códigos expirados
- **UX**: Mensajes claros y feedback visual
- **Email Personalizado**: Template HTML profesional

## 👥 Módulo de Administración

### Funcionalidades
- **Listado de Usuarios**: Vista paginada de todos los usuarios registrados
- **Filtros Avanzados**: Búsqueda por nombre, email, teléfono, estado y plan
- **Edición de Usuarios**: Modificación de información personal
- **Gestión de Estados**: Activación/desactivación de usuarios
- **Gestión de Planes**: Asignación de planes (mensual, anual, gratis)
- **Estadísticas**: Métricas en tiempo real de usuarios

### Características Técnicas
- **Integración con Cognito**: Uso directo de AWS SDK v3
- **Paginación**: 10 usuarios por página
- **Filtros en Tiempo Real**: Búsqueda instantánea
- **Modal de Edición**: Interfaz limpia para modificar usuarios
- **Modal de Vista**: Vista detallada de información del usuario
- **Validación**: Verificación de datos antes de guardar
- **Manejo de Filtros Largos**: Automático truncamiento para evitar errores de Cognito
- **AWS SDK v3**: Migración completa a la versión más reciente

### Acceso
- Ruta: `/admin/users`
- Acceso desde el dashboard principal
- Requiere autenticación

## 🎨 Estilos

El proyecto utiliza Tailwind CSS con:
- Sistema de colores personalizado
- Modo oscuro/claro
- Diseño responsivo
- Animaciones y transiciones
- Componentes reutilizables

## 🚦 Desarrollo Local

### Prerrequisitos
- Node.js 18.0.0 o superior
- npm o yarn
- Cuenta AWS con Cognito configurado
- Cuenta Mailgun para emails

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/yourusername/urbex.git
cd urbex

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
```

### Configuración de AWS Cognito

**⚠️ Importante**: Antes de usar el sistema de registro, debes configurar el atributo personalizado `custom:plan` en tu User Pool de Cognito.

#### Opción 1: Usando AWS Console (Recomendado)
1. Ve a **AWS Console** → **Cognito** → **User Pools** → **Tu User Pool**
2. Ve a **Sign-up experience** → **Custom attributes**
3. Crea un atributo con:
   - **Name**: `plan`
   - **Type**: `String`
   - **Required**: `No`
   - **Mutable**: `Yes`

#### Opción 2: Usando Script Automático
```bash
# Configurar variables de entorno
export AWS_USER_POOL_ID="tu-user-pool-id"
export AWS_REGION="us-east-2"

# Ejecutar script de configuración
node scripts/setup-cognito-attributes.js
```

#### Después de la Configuración
Una vez configurado el atributo personalizado:
1. Descomenta el código en `src/lib/aws/cognito.ts` (líneas 87-90)
2. El sistema de registro funcionará completamente

Para más detalles, consulta [docs/cognito-setup.md](./docs/cognito-setup.md).

### Configuración de Email de Confirmación

**⚠️ Importante**: Si no recibes emails de confirmación después del registro, verifica la configuración de email en Cognito.

#### Diagnóstico Rápido
```bash
# Verificar configuración de email
export AWS_USER_POOL_ID="tu-user-pool-id"
export AWS_REGION="us-east-2"
node scripts/check-cognito-email-config.js
```

#### Configuración Manual en AWS Console
1. Ve a **AWS Console** → **Cognito** → **User Pools** → **Tu User Pool**
2. Ve a **Messaging** → **Email configuration**
3. Configura:
   - **Email source**: `COGNITO_DEFAULT` (recomendado)
   - **Reply-to email address**: Tu email de soporte
4. Ve a **Sign-up experience** → **Cognito-assisted verification and confirmation**
5. Habilita **Cognito-assisted verification and confirmation**
6. Marca **Email** como método de verificación

#### Solución de Problemas
- Revisa la carpeta de spam
- Usa el botón "Reenviar código" en la página de verificación
- Verifica que el email esté correctamente escrito

Para más detalles, consulta [docs/email-troubleshooting.md](./docs/email-troubleshooting.md).

### Variables de Entorno
```env
# AWS Cognito
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_USER_POOL_ID=your_user_pool_id
AWS_POOL_CLIENT_ID=your_client_id

# Mailgun (Requerido para password reset)
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
CONTACT_EMAIL=your_contact_email
```

## 📦 Despliegue en AWS

### Prerrequisitos
- Cuenta AWS
- AWS CLI instalado y configurado
- Node.js y npm instalados
- Cuenta Mailgun configurada

### Configuración del Bucket S3
1. Crear bucket:
```bash
aws s3 mb s3://tu-nombre-de-bucket
```

2. Configurar hosting estático:
```bash
aws s3 website s3://tu-nombre-de-bucket --index-document index.html --error-document 404.html
```

3. Configurar política de acceso público:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::tu-nombre-de-bucket/*"
        }
    ]
}
```

### Pasos de Despliegue
1. Construir el proyecto:
```bash
npm run build
```

2. Desplegar a S3:
```bash
npm run deploy:s3-only
```

3. Despliegue completo (S3 + CloudFront):
```bash
npm run deploy
```

### Configuración de CloudFront
El proyecto incluye configuración automática para CloudFront que maneja:
- **SPA Routing**: Redirección de rutas a index.html
- **Cache Optimization**: Headers optimizados para archivos estáticos
- **Error Handling**: Manejo de errores 404/403

## 🔄 Flujo de Desarrollo
1. Crear componentes específicos en el directorio correspondiente
2. Utilizar componentes UI compartidos para consistencia
3. Implementar diseños responsivos con Tailwind
4. Probar en múltiples dispositivos
5. Seguir las convenciones de TypeScript

## 📝 Licencia
Este proyecto está bajo la Licencia MIT.

## 🤝 Contribución
Las contribuciones son bienvenidas. Por favor, sigue estos pasos:
1. Crea una rama para tu feature
2. Realiza tus cambios
3. Envía un Pull Request

---

Desarrollado con ❤️ por el Equipo Urbex

## 🔧 Configuración del Entorno

### Variables de Entorno
1. Copia el archivo `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Configura las siguientes variables en `.env.local`:
   ```
   # AWS Cognito Configuration
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_USER_POOL_ID=your_user_pool_id
   AWS_POOL_CLIENT_ID=your_client_id

   # Mailgun Configuration (Required for password reset)
   MAILGUN_API_KEY=tu-api-key-de-mailgun
   MAILGUN_DOMAIN=tu-dominio-verificado
   CONTACT_EMAIL=email-donde-recibir-los-mensajes

   # API Configuration
   NEXT_PUBLIC_API_URL=tu-api-url
   ```

3. **Importante**: Nunca subas el archivo `.env.local` a GitHub. Este archivo contiene información sensible.

### Obtener Credenciales de Mailgun
1. Regístrate en [Mailgun](https://www.mailgun.com/)
2. Verifica tu dominio
3. Obtén tu API key desde el dashboard
4. Configura las variables de entorno con tus credenciales

## 🏆 Estado del Proyecto

### 📊 Auditoría Reciente (Diciembre 2024)

#### **Puntuaciones Generales**
- **✅ Performance**: 92.4% optimización de imágenes lograda
- **✅ SEO**: 94/100 score con Schema markup completo
- **⚠️ Testing**: 49 tests (32 pasando, 17 fallando) - **CRÍTICO**
- **✅ Seguridad**: AWS Cognito implementado
- **✅ Velocidad**: Build time 14s, bundle optimizado

#### **Áreas Críticas Identificadas**
1. **Tests Fallidos**: AuthProvider context error en 17 tests
2. **AWS SDK v2**: Deprecation warning - migrar a v3
3. **Baja Cobertura**: 2.45% statements, 1.71% branches

#### **Plan de Acción Inmediato**
- 🔥 **CRÍTICO**: Arreglar tests y migrar AWS SDK v3
- ⚡ **ALTA**: Optimizar bundle size y aumentar cobertura
- 📈 **MEDIO**: Implementar monitoring y SEO avanzado

#### **Archivos de Auditoría**
- 📋 `PROJECT_AUDIT_REPORT.md` - Reporte completo de auditoría
- 📊 `PERFORMANCE_REPORT.md` - Análisis detallado de performance
- 🔍 `SEO_AUDIT_REPORT.md` - Auditoría SEO completa
- 🚀 `OPTIMIZATION_SUMMARY.md` - Resumen de optimizaciones

### 🛠️ Scripts Disponibles

#### Scripts Consolidados

El proyecto ha sido optimizado con scripts consolidados que combinan funcionalidades relacionadas:

##### 🚀 Scripts de Despliegue
```bash
npm run deploy                    # Despliegue completo (por defecto)
npm run deploy:prepare           # Solo preparar archivos
npm run deploy:s3-only           # Solo desplegar a S3 (sin CloudFront)
```

##### 🧪 Scripts de Testing
```bash
npm test                         # Ejecutar tests
npm run test:coverage           # Tests con cobertura
npm run test:watch              # Tests en modo watch
npm run test:users:api          # Probar endpoints de API
npm run test:users:attributes   # Probar atributos de usuario
npm run test:users:errors       # Probar manejo de errores
npm run test:users:disabled     # Probar usuario deshabilitado
```

##### 🔧 Scripts de Gestión de Cognito
```bash
npm run cognito:list             # Listar usuarios
npm run cognito:get <email>      # Obtener usuario específico
npm run cognito:update-attributes # Actualizar atributos de todos los usuarios
npm run cognito:setup-attributes  # Configurar atributos personalizados
npm run cognito:check-config     # Verificar configuración actual
npm run cognito:configure        # Configurar verificación de email
```

##### ⚡ Scripts de Performance
```bash
npm run optimize-images          # Optimizar imágenes
npm run build                   # Build de producción
```

##### 🔄 Scripts de Migración
```bash
node scripts/migrate-aws-sdk-v3.js  # Guía de migración v2→v3
node scripts/cleanup-duplicates.js  # Limpiar scripts duplicados
```

#### Beneficios de la Consolidación

1. **Menos Mantenimiento**: Menos archivos que mantener y actualizar
2. **Mejor Organización**: Funcionalidades relacionadas agrupadas
3. **UX Mejorada**: Interfaz de línea de comandos consistente
4. **Funciones Mejoradas**: Más opciones y mejor manejo de errores
5. **Documentación Clara**: Una sola fuente de verdad para cada categoría

Para más detalles, consulta [docs/scripts.md](./docs/scripts.md).
