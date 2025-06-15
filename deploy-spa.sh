#!/bin/bash

# Deploy SPA to S3 with CloudFront invalidation
# Usage: ./deploy-spa.sh [bucket-name] [cloudfront-distribution-id]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variables
BUCKET_NAME=${1:-"urbex.com.co-production"}
DISTRIBUTION_ID=${2}
REGION="us-east-2"

# Función para verificar credenciales de AWS
check_aws_credentials() {
    echo -e "${YELLOW}🔑 Verificando credenciales de AWS...${NC}"
    
    # Verificar si las variables de entorno están configuradas
    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        echo -e "${RED}❌ Credenciales de AWS no encontradas en variables de entorno${NC}"
        echo -e "${YELLOW}Por favor, configura las siguientes variables de entorno:${NC}"
        echo "export AWS_ACCESS_KEY_ID=tu_access_key"
        echo "export AWS_SECRET_ACCESS_KEY=tu_secret_key"
        echo "export AWS_DEFAULT_REGION=$REGION"
        exit 1
    fi

    # Verificar si las credenciales son válidas
    if ! aws sts get-caller-identity &>/dev/null; then
        echo -e "${RED}❌ Credenciales de AWS inválidas${NC}"
        echo -e "${YELLOW}Por favor, verifica tus credenciales y vuelve a intentar${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Credenciales de AWS verificadas${NC}"
}

# Función para verificar el bucket de S3
check_s3_bucket() {
    echo -e "${YELLOW}🔍 Verificando bucket de S3...${NC}"
    
    if ! aws s3 ls "s3://$BUCKET_NAME" &>/dev/null; then
        echo -e "${RED}❌ No se puede acceder al bucket $BUCKET_NAME${NC}"
        echo -e "${YELLOW}Por favor, verifica que:${NC}"
        echo "1. El bucket existe"
        echo "2. Tienes permisos para acceder al bucket"
        echo "3. El nombre del bucket es correcto"
        exit 1
    fi

    echo -e "${GREEN}✅ Bucket de S3 verificado${NC}"
}

# Función para verificar la distribución de CloudFront
check_cloudfront_distribution() {
    if [ ! -z "$DISTRIBUTION_ID" ]; then
        echo -e "${YELLOW}🔍 Verificando distribución de CloudFront...${NC}"
        
        if ! aws cloudfront get-distribution --id $DISTRIBUTION_ID &>/dev/null; then
            echo -e "${RED}❌ No se puede acceder a la distribución de CloudFront${NC}"
            echo -e "${YELLOW}Por favor, verifica que:${NC}"
            echo "1. El ID de distribución es correcto"
            echo "2. Tienes permisos para acceder a CloudFront"
            exit 1
        fi

        echo -e "${GREEN}✅ Distribución de CloudFront verificada${NC}"
    fi
}

echo -e "${YELLOW}🚀 Iniciando despliegue de Urbex SPA...${NC}"

# Verificar credenciales y recursos
check_aws_credentials
check_s3_bucket
check_cloudfront_distribution

# 1. Build de la aplicación
echo -e "\n${YELLOW}📦 Construyendo la aplicación...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en el build${NC}"
    exit 1
fi

# 2. Copiar archivos de configuración
echo -e "\n${YELLOW}📋 Copiando archivos de configuración...${NC}"
cp public/_redirects out/
cp vercel.json out/

# 3. Subir archivos a S3
echo -e "\n${YELLOW}📤 Subiendo archivos a S3...${NC}"

# Subir archivos estáticos con caché largo
aws s3 sync out/ s3://$BUCKET_NAME/ \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html" \
    --exclude "*.json" \
    --exclude "_redirects" \
    --region $REGION

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al subir archivos estáticos a S3${NC}"
    exit 1
fi

# Subir HTML, JSON y _redirects con no-cache
aws s3 sync out/ s3://$BUCKET_NAME/ \
    --delete \
    --cache-control "no-cache" \
    --include "*.html" \
    --include "*.json" \
    --include "_redirects" \
    --region $REGION

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al subir archivos HTML/JSON a S3${NC}"
    exit 1
fi

# 4. Invalidar caché de CloudFront
if [ ! -z "$DISTRIBUTION_ID" ]; then
    echo -e "\n${YELLOW}🔄 Invalidando caché de CloudFront...${NC}"
    aws cloudfront create-invalidation \
        --distribution-id $DISTRIBUTION_ID \
        --paths "/*" \
        --region $REGION

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error al invalidar caché de CloudFront${NC}"
        exit 1
    fi
else
    echo -e "\n${YELLOW}⚠️  No se proporcionó ID de distribución de CloudFront, omitiendo invalidación${NC}"
fi

echo -e "\n${GREEN}✅ ¡Despliegue completado exitosamente!${NC}"
if [ ! -z "$DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}⏳ La invalidación de caché puede tomar unos minutos...${NC}"
fi

echo -e "${GREEN}🎉 SPA deployment completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Test the website in different routes (e.g., /dashboard, /auth/login)"
echo "2. Verify that browser refresh works on all routes"
echo "3. Check that 404 errors redirect to the main app"
echo ""
echo -e "${GREEN}✨ Your SPA is now live and should handle all routes correctly!${NC}" 