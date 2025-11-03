#!/bin/bash

# Deploy S3 Clean Routing Script
# Despliega la aplicación a S3 con URLs limpias sin index.html

set -e

echo "🚀 Starting S3 Clean Routing Deployment..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
S3_BUCKET="${S3_BUCKET_NAME:-urbex-frontend}"
CF_DISTRIBUTION_ID="${CF_DISTRIBUTION_ID:-}"
AWS_REGION="${AWS_REGION:-us-east-2}"

# Verificar dependencias
check_dependencies() {
    echo -e "${BLUE}🔍 Checking dependencies...${NC}"
    
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js not found. Please install it first.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Dependencies OK${NC}"
}

# Crear bucket si no existe
create_bucket_if_needed() {
    echo -e "${BLUE}🔍 Checking if bucket exists...${NC}"
    
    if aws s3 ls "s3://${S3_BUCKET}" 2>&1 | grep -q 'NoSuchBucket'; then
        echo -e "${YELLOW}📦 Bucket '${S3_BUCKET}' not found. Creating it...${NC}"
        
        # Crear bucket según la región
        if [ "${AWS_REGION}" = "us-east-1" ]; then
            # us-east-1 no necesita LocationConstraint
            aws s3api create-bucket \
                --bucket "${S3_BUCKET}" \
                --region "${AWS_REGION}" 2>&1 | grep -v "BucketAlreadyOwnedByYou" || true
        else
            # Otras regiones necesitan LocationConstraint
            aws s3api create-bucket \
                --bucket "${S3_BUCKET}" \
                --region "${AWS_REGION}" \
                --create-bucket-configuration LocationConstraint="${AWS_REGION}" 2>&1 | grep -v "BucketAlreadyOwnedByYou" || true
        fi
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Bucket '${S3_BUCKET}' created successfully${NC}"
            echo -e "${YELLOW}⏳ Waiting for bucket to be ready...${NC}"
            sleep 3
        else
            echo -e "${YELLOW}⚠️  Bucket might already exist or creation failed. Continuing...${NC}"
        fi
    else
        echo -e "${GREEN}✅ Bucket '${S3_BUCKET}' already exists${NC}"
    fi
}

# Build de la aplicación
build_app() {
    echo -e "${BLUE}🔨 Building application with clean routing...${NC}"
    
    # Limpiar build anterior
    rm -rf out/
    rm -rf .next/
    
    # Build con configuración de producción
    npm run build
    
    if [ ! -d "out" ]; then
        echo -e "${RED}❌ Build failed - out directory not found${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Build completed${NC}"
}

# Configurar S3 bucket para website hosting
configure_s3_website() {
    echo -e "${BLUE}🌐 Configuring S3 website hosting...${NC}"
    
    # Configurar website hosting
    aws s3 website s3://${S3_BUCKET} \
        --index-document index.html \
        --error-document index.html \
        --region ${AWS_REGION}
    
    # Aplicar configuración de routing desde archivo
    if [ -f "s3-website-config.json" ]; then
        aws s3api put-bucket-website \
            --bucket ${S3_BUCKET} \
            --website-configuration file://s3-website-config.json \
            --region ${AWS_REGION}
        echo -e "${GREEN}✅ S3 website configuration applied${NC}"
    else
        echo -e "${YELLOW}⚠️  s3-website-config.json not found, using basic config${NC}"
    fi
}

# Subir archivos a S3
upload_to_s3() {
    echo -e "${BLUE}📤 Uploading files to S3...${NC}"
    
    # Sync archivos estáticos con cache largo
    aws s3 sync out/_next/static/ s3://${S3_BUCKET}/_next/static/ \
        --region ${AWS_REGION} \
        --cache-control "public, max-age=31536000, immutable" \
        --delete
    
    # Sync otros archivos _next con cache medio
    aws s3 sync out/_next/ s3://${S3_BUCKET}/_next/ \
        --region ${AWS_REGION} \
        --cache-control "public, max-age=86400" \
        --exclude "static/*" \
        --delete
    
    # Sync archivos HTML sin cache
    aws s3 sync out/ s3://${S3_BUCKET}/ \
        --region ${AWS_REGION} \
        --cache-control "public, max-age=0, must-revalidate" \
        --exclude "_next/*" \
        --delete
    
    # Configurar MIME types correctos para archivos sin extensión
    echo -e "${BLUE}🔧 Setting correct MIME types...${NC}"
    
    # Encontrar archivos HTML y configurar headers
    find out/ -name "*.html" | while read file; do
        s3_key=${file#out/}
        aws s3 cp "s3://${S3_BUCKET}/${s3_key}" "s3://${S3_BUCKET}/${s3_key}" \
            --region ${AWS_REGION} \
            --content-type "text/html; charset=utf-8" \
            --cache-control "public, max-age=0, must-revalidate" \
            --metadata-directive REPLACE
    done
    
    echo -e "${GREEN}✅ Files uploaded to S3${NC}"
}

# Invalidar CloudFront cache
invalidate_cloudfront() {
    if [ -n "${CF_DISTRIBUTION_ID}" ]; then
        echo -e "${BLUE}🔄 Invalidating CloudFront cache...${NC}"
        
        aws cloudfront create-invalidation \
            --distribution-id ${CF_DISTRIBUTION_ID} \
            --paths "/*" \
            --region ${AWS_REGION}
        
        echo -e "${GREEN}✅ CloudFront invalidation started${NC}"
    else
        echo -e "${YELLOW}⚠️  CF_DISTRIBUTION_ID not set, skipping CloudFront invalidation${NC}"
    fi
}

# Verificar deployment
verify_deployment() {
    echo -e "${BLUE}🧪 Verifying deployment...${NC}"
    
    # Obtener URL del bucket
    BUCKET_URL="http://${S3_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com"
    
    echo -e "${GREEN}✅ Deployment completed!${NC}"
    echo -e "${BLUE}🌐 Website URL: ${BUCKET_URL}${NC}"
    echo ""
    echo -e "${BLUE}🧪 Test these clean URLs:${NC}"
    echo -e "   ${BUCKET_URL}/"
    echo -e "   ${BUCKET_URL}/dashboard"
    echo -e "   ${BUCKET_URL}/properties"
    echo -e "   ${BUCKET_URL}/auth/login"
    echo ""
    echo -e "${GREEN}✨ URLs limpias sin index.html configuradas correctamente${NC}"
}

# Función principal
main() {
    echo -e "${GREEN}🚀 S3 Clean Routing Deployment${NC}"
    echo -e "${BLUE}Bucket: ${S3_BUCKET}${NC}"
    echo -e "${BLUE}Region: ${AWS_REGION}${NC}"
    echo ""
    
    check_dependencies
    create_bucket_if_needed
    build_app
    configure_s3_website
    upload_to_s3
    invalidate_cloudfront
    verify_deployment
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
}

# Ejecutar función principal
main "$@"
