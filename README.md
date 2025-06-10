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

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Gestión de Estado**: React Hooks
- **Despliegue**: AWS S3

## 📁 Estructura del Proyecto

```
src/
  ├── features/
  │   └── landing/
  │       ├── components/
  │       │   ├── Hero.tsx         # Carrusel principal
  │       │   ├── Services.tsx     # Sección de servicios
  │       │   ├── Team.tsx         # Sección del equipo
  │       │   ├── Clients.tsx      # Carrusel de clientes
  │       │   └── Contact.tsx      # Formulario de contacto
  │       └── pages/
  ├── components/
  │   └── ui/
  │       └── theme-provider.tsx   # Proveedor de tema
  └── styles/
```

## 🧩 Componentes Principales

### Hero
- Carrusel de imágenes con transiciones suaves
- Botones de llamada a la acción
- Adaptación automática al tema del sistema
- Navegación a secciones específicas

### Services
- Presentación de servicios con iconos SVG
- Diseño responsivo en grid
- Animaciones en hover
- Descripciones detalladas de cada servicio

### Team
- Presentación del equipo con imágenes circulares
- Efectos de hover
- Información profesional de cada miembro
- Diseño adaptativo

### Clients
- Carrusel infinito de logos de clientes
- Adaptación de colores según el tema
- Transiciones suaves
- Sin controles de navegación

### Contact
- Formulario de contacto completo
- Validación de campos
- Campos para nombre, email, teléfono y mensaje
- Diseño responsivo y adaptativo

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

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/yourusername/urbex.git
cd urbex

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## 📦 Despliegue en AWS S3

### Prerrequisitos
- Cuenta AWS
- AWS CLI instalado y configurado
- Node.js y npm instalados

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
npm run export
```

2. Desplegar a S3:
```bash
./s3-deploy.sh
```

### Configuración de Dominio Personalizado (Opcional)
1. Crear zona hospedada en Route 53
2. Crear certificado SSL en AWS Certificate Manager
3. Configurar CloudFront con el dominio personalizado
4. Actualizar registros DNS en Route 53

## 🔄 Flujo de Desarrollo
1. Crear componentes específicos en el directorio correspondiente
2. Utilizar componentes UI compartidos para consistencia
3. Implementar diseños responsivos con Tailwind
4. Probar en múltiples dispositivos

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
   # Mailgun Configuration
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
