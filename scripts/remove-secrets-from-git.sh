#!/bin/bash

# Script para remover secretos del historial de Git
# Uso: ./scripts/remove-secrets-from-git.sh

set -e

echo "🔒 Removing secrets from Git history..."
echo ""
echo "⚠️  WARNING: This will rewrite Git history!"
echo "   Make sure you backup your branch before proceeding."
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cancelled."
    exit 1
fi

echo ""
echo "1️⃣  Removing public/env.js from Git tracking..."
git rm --cached public/env.js 2>/dev/null || echo "   (File not tracked)"

echo ""
echo "2️⃣  Removing secrets from scripts/generate-env-js.js..."
echo "   (Already done in code changes)"

echo ""
echo "3️⃣  Committing changes..."
git add .gitignore
git add scripts/generate-env-js.js
git add public/env.js 2>/dev/null || true

# Create a commit that removes the secrets
git commit -m "🔒 SECURITY: Remove hardcoded AWS secrets and add env.js to gitignore

- Removed AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY from generate-env-js.js
- Added public/env.js to .gitignore (generated file should not be in repo)
- Secrets should only come from .env.local files
- Server-side secrets should never be in frontend code"

echo ""
echo "✅ Changes committed!"
echo ""
echo "📋 Next steps:"
echo "   1. If secrets were already pushed, you need to:"
echo "      - Rotate/revoke the exposed AWS credentials IMMEDIATELY"
echo "      - Check AWS CloudTrail for any unauthorized access"
echo ""
echo "   2. Create/update .env.local with your secrets (never commit this):"
echo "      AWS_ACCESS_KEY_ID=your_key"
echo "      AWS_SECRET_ACCESS_KEY=your_secret"
echo "      ..."
echo ""
echo "   3. Regenerate env.js:"
echo "      npm run env:generate --env=production"
echo ""
echo "   4. Force push ONLY if you're on a feature branch (be careful!):"
echo "      git push origin feature/urbex-002 --force"
echo ""
echo "   ⚠️  NEVER force push to main/master branch!"

