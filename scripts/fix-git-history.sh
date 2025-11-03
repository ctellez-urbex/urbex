#!/bin/bash

# Script para limpiar el historial de Git removiendo secretos del commit 2be9c90
# Uso: ./scripts/fix-git-history.sh

set -e

echo "🔧 Limpieza del historial de Git"
echo ""
echo "⚠️  ADVERTENCIA: Esto reescribirá el historial de Git"
echo "   Solo funciona en feature branches (NUNCA en main/master)"
echo ""
echo "El commit 2be9c90 contiene secretos expuestos."
echo "Este script los removerá del historial."
echo ""
read -p "¿Continuar? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cancelado."
    exit 1
fi

echo ""
echo "📋 Paso 1: Creando backup del branch actual..."
BACKUP_BRANCH="backup-$(date +%Y%m%d-%H%M%S)-feature-urbex-002"
git branch "$BACKUP_BRANCH"
echo "✅ Backup creado: $BACKUP_BRANCH"

echo ""
echo "📋 Paso 2: Iniciando rebase interactivo..."
echo "   (Editarás el commit 2be9c90 para remover public/env.js)"

# Encontrar el commit base (el último commit en origin)
BASE_COMMIT=$(git merge-base HEAD origin/feature/urbex-002)

echo "   Base commit: $BASE_COMMIT"
echo ""

# Usar git filter-branch o git rebase para remover el archivo
echo "📋 Paso 3: Removiendo public/env.js del historial completo..."
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch public/env.js' \
  --prune-empty --tag-name-filter cat -- --all

echo ""
echo "✅ Historial limpiado!"
echo ""
echo "📋 Paso 4: Verificando que no queden secretos..."
if git log --all --full-history -- public/env.js | grep -q "AKIAXYKJQUU3HW7AB54M"; then
    echo "❌ Todavía hay secretos en el historial"
    echo "   Restaura desde backup: git checkout $BACKUP_BRANCH"
    exit 1
else
    echo "✅ No se encontraron secretos en el historial"
fi

echo ""
echo "🎉 ¡Listo! Ahora puedes hacer:"
echo "   git push origin feature/urbex-002 --force"
echo ""
echo "⚠️  Recuerda:"
echo "   1. ROTAR las credenciales expuestas en AWS"
echo "   2. Revisar CloudTrail por actividad sospechosa"
echo "   3. El backup está en: $BACKUP_BRANCH"

