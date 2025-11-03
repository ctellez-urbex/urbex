#!/bin/bash

# Fix Dashboard Routing Script
# Soluciona problemas específicos de routing del dashboard en S3

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Solucionando routing del Dashboard...${NC}"

# Step 1: Verificar estado actual
echo -e "\n${YELLOW}📋 Paso 1: Verificando estado actual...${NC}"

# Verificar si existe el archivo dashboard local
if [ -f "out/dashboard/index.html" ]; then
    FILE_SIZE=$(ls -la out/dashboard/index.html | awk '{print $5}')
    echo -e "${GREEN}✅ out/dashboard/index.html existe (${FILE_SIZE} bytes)${NC}"
else
    echo -e "${RED}❌ out/dashboard/index.html NO existe${NC}"
    echo -e "${YELLOW}🔄 Ejecutando build...${NC}"
    npm run build
fi

# Step 2: Verificar contenido del archivo
echo -e "\n${YELLOW}📋 Paso 2: Verificando contenido del dashboard...${NC}"

if grep -q "Dashboard" out/dashboard/index.html; then
    echo -e "${GREEN}✅ Contenido del dashboard parece correcto${NC}"
else
    echo -e "${RED}❌ Contenido del dashboard puede estar corrupto${NC}"
fi

# Step 3: Test local
echo -e "\n${YELLOW}📋 Paso 3: Probando routing local...${NC}"

# Iniciar servidor de prueba en background
node scripts/test-spa-routing.js > dashboard_test.log 2>&1 &
SERVER_PID=$!

# Esperar a que el servidor inicie
sleep 3

# Test del dashboard
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/dashboard)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Test local exitoso (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Test local falló (HTTP $HTTP_CODE)${NC}"
fi

# Detener servidor de prueba
kill $SERVER_PID 2>/dev/null || true

# Step 4: Verificar estructura de archivos
echo -e "\n${YELLOW}📋 Paso 4: Verificando estructura de archivos...${NC}"

echo -e "${BLUE}Estructura del directorio out/:${NC}"
ls -la out/ | grep -E "(dashboard|index\.html)" || echo "No se encontraron archivos relacionados"

echo -e "\n${BLUE}Contenido del directorio dashboard/:${NC}"
if [ -d "out/dashboard" ]; then
    ls -la out/dashboard/
else
    echo -e "${RED}❌ Directorio dashboard/ no existe${NC}"
fi

# Step 5: Generar reporte
echo -e "\n${YELLOW}📋 Paso 5: Generando reporte de diagnóstico...${NC}"

REPORT_FILE="dashboard-routing-report.txt"
cat > $REPORT_FILE << EOF
Dashboard Routing Diagnostic Report
==================================
Fecha: $(date)
Usuario: $(whoami)
Directorio: $(pwd)

Archivos Verificados:
--------------------
EOF

if [ -f "out/dashboard/index.html" ]; then
    echo "✅ out/dashboard/index.html: $(ls -la out/dashboard/index.html | awk '{print $5}') bytes" >> $REPORT_FILE
else
    echo "❌ out/dashboard/index.html: NO EXISTE" >> $REPORT_FILE
fi

if [ -f "out/index.html" ]; then
    echo "✅ out/index.html: $(ls -la out/index.html | awk '{print $5}') bytes" >> $REPORT_FILE
else
    echo "❌ out/index.html: NO EXISTE" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE
echo "Test Local:" >> $REPORT_FILE
echo "HTTP Response Code: $HTTP_CODE" >> $REPORT_FILE

echo "" >> $REPORT_FILE
echo "Estructura de Directorios:" >> $REPORT_FILE
find out/ -name "*.html" | head -10 >> $REPORT_FILE

echo -e "${GREEN}✅ Reporte generado: $REPORT_FILE${NC}"

# Step 6: Sugerencias de solución
echo -e "\n${YELLOW}📋 Paso 6: Sugerencias de solución...${NC}"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}🎉 El routing local funciona correctamente.${NC}"
    echo -e "${BLUE}💡 Si el problema es en S3, ejecuta:${NC}"
    echo -e "   1. npm run deploy:s3"
    echo -e "   2. Verificar configuración de CloudFront"
    echo -e "   3. Invalidar cache de CloudFront"
else
    echo -e "${RED}🚨 Hay problemas con el routing local.${NC}"
    echo -e "${BLUE}💡 Soluciones sugeridas:${NC}"
    echo -e "   1. npm run clean"
    echo -e "   2. npm run build"
    echo -e "   3. Verificar página dashboard/page.tsx"
fi

# Step 7: Comandos útiles
echo -e "\n${BLUE}🔧 Comandos útiles para debugging:${NC}"
echo -e "   Ver logs del servidor: cat dashboard_test.log"
echo -e "   Test manual: curl -I http://localhost:3001/dashboard"
echo -e "   Rebuild completo: npm run clean && npm run build"
echo -e "   Deploy a S3: npm run deploy:s3"

# Step 8: Cleanup
echo -e "\n${YELLOW}🧹 Limpiando archivos temporales...${NC}"
rm -f dashboard_test.log

echo -e "\n${GREEN}✅ Diagnóstico del Dashboard completado${NC}"
echo -e "${BLUE}📄 Revisa el archivo: $REPORT_FILE${NC}"

# Mostrar resumen final
echo -e "\n${BLUE}📊 RESUMEN:${NC}"
if [ -f "out/dashboard/index.html" ]; then
    echo -e "   Archivo local: ${GREEN}✅ OK${NC}"
else
    echo -e "   Archivo local: ${RED}❌ FALTA${NC}"
fi

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "   Test local: ${GREEN}✅ OK (HTTP $HTTP_CODE)${NC}"
else
    echo -e "   Test local: ${RED}❌ FALLA (HTTP $HTTP_CODE)${NC}"
fi

echo -e "\n${YELLOW}🚀 Próximo paso: Verificar en producción (S3/CloudFront)${NC}"
