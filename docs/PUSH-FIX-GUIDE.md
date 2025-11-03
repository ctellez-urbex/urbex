# 🚀 Guía para Resolver el Push Bloqueado

## 📊 Estado Actual

✅ **Completado:**
- Secretos removidos de `scripts/generate-env-js.js`
- `public/env.js` agregado a `.gitignore`
- `public/env.js` removido del tracking de Git
- Commit de seguridad creado (8c611f9)

❌ **Problema Pendiente:**
- El commit `2be9c90` todavía contiene `public/env.js` con secretos
- GitHub bloqueará el push porque ese commit está en el historial

## 🔧 OPCIONES PARA RESOLVER

### OPCIÓN 1: Limpiar Historial con Rebase (Recomendado)

**Solo para feature branches - NUNCA en main/master**

```bash
# 1. Crear backup
git branch backup-feature-urbex-002

# 2. Rebase interactivo para editar el commit problemático
git rebase -i 61795d5

# 3. En el editor que se abre:
#    - Cambia "pick 2be9c90" a "edit"
#    - Guarda y cierra

# 4. Remover el archivo del commit
git rm --cached public/env.js
git commit --amend --no-edit

# 5. Continuar el rebase
git rebase --continue

# 6. Verificar que no hay secretos
git log --all --full-history -- public/env.js | grep "AKIAXYKJQUU3HW7AB54M" || echo "✅ Limpio"

# 7. Force push (solo en feature branch)
git push origin feature/urbex-002 --force
```

### OPCIÓN 2: Crear Branch Nuevo Limpio (Más Seguro)

```bash
# 1. Ir a main y actualizar
git checkout main
git pull origin main

# 2. Crear nuevo branch limpio
git checkout -b feature/urbex-002-clean

# 3. Aplicar cambios sin secretos (cherry-pick commits limpios)
git cherry-pick 61795d5  # change property
git cherry-pick c26f694  # change doc  
git cherry-pick 8c611f9  # security fix

# 4. Push nuevo branch
git push origin feature/urbex-002-clean

# 5. Crear PR desde nuevo branch
```

### OPCIÓN 3: Usar Filter-Branch (Para limpiar todo el historial)

```bash
# 1. Backup completo
git branch backup-all-$(date +%Y%m%d)

# 2. Remover public/env.js de todo el historial
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch public/env.js' \
  --prune-empty --tag-name-filter cat -- --all

# 3. Limpiar referencias
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d

# 4. Force push
git push origin feature/urbex-002 --force --all
```

## ⚠️ ANTES DE CUALQUIER PUSH

### PASO CRÍTICO: Rotar Credenciales

**Las credenciales expuestas DEBEN ser rotadas INMEDIATAMENTE:**

```bash
# 1. Ve a AWS Console
# 2. IAM → Users → Security credentials
# 3. DESACTIVA/Elimina: AKIAXYKJQUU3HW7AB54M
# 4. Crea nueva Access Key
# 5. Actualiza .env.local con nuevas credenciales
```

**Revisa CloudTrail para verificar si hubo uso no autorizado.**

## 📋 Checklist Pre-Push

- [ ] Credenciales AWS rotadas en AWS Console
- [ ] Nueva Access Key creada y guardada en `.env.local`
- [ ] Historial de Git limpiado (opción 1, 2 o 3)
- [ ] Verificado que no hay secretos: `git log --all --grep="AKIA" || echo "OK"`
- [ ] Backup del branch creado
- [ ] CloudTrail revisado

## 🎯 Recomendación

**Para tu caso, usa OPCIÓN 1 (Rebase Interactivo):**

1. Es más simple
2. Solo afecta tu feature branch
3. Mantiene el historial de cambios útil
4. GitHub aceptará el push después

**Pasos simplificados:**

```bash
# Ejecutar esto secuencialmente:
git branch backup-feature-urbex-002
git rebase -i 61795d5
# [Editar: cambiar "pick 2be9c90" a "edit"]
git rm --cached public/env.js
git commit --amend --no-edit
git rebase --continue
git push origin feature/urbex-002 --force
```

## 🔍 Verificación Post-Fix

```bash
# Verificar que no hay secretos en el historial
git log --all --full-history -S "AKIAXYKJQUU3HW7AB54M" || echo "✅ Limpio"

# Verificar que public/env.js no está en commits
git log --all --full-history -- public/env.js | head -5 || echo "✅ No encontrado"

# Verificar .gitignore
git show HEAD:.gitignore | grep "public/env.js" && echo "✅ En gitignore"
```

## 🆘 Si Algo Sale Mal

```bash
# Restaurar desde backup
git checkout backup-feature-urbex-002
git branch -D feature/urbex-002
git checkout -b feature/urbex-002
```

---

**Última actualización:** $(date)
**Branch:** feature/urbex-002

