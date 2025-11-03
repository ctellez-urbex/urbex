#!/bin/bash

# Clean Build Script
# This script cleans all build artifacts and cache to resolve build issues

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Starting clean build process...${NC}"

# Stop any running Next.js processes
echo -e "${YELLOW}🛑 Stopping any running Next.js processes...${NC}"
pkill -f "next dev" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
pkill -f "next build" 2>/dev/null || true

# Clean Next.js build artifacts
echo -e "${YELLOW}🗑️  Cleaning Next.js build artifacts...${NC}"
rm -rf .next
rm -rf out
echo -e "${GREEN}✅ Next.js build artifacts cleaned${NC}"

# Clean node_modules cache
echo -e "${YELLOW}🗑️  Cleaning node_modules cache...${NC}"
rm -rf node_modules/.cache
echo -e "${GREEN}✅ Node modules cache cleaned${NC}"

# Clean npm cache (optional)
echo -e "${YELLOW}🗑️  Cleaning npm cache...${NC}"
npm cache clean --force 2>/dev/null || true
echo -e "${GREEN}✅ NPM cache cleaned${NC}"

# Clean TypeScript build info
echo -e "${YELLOW}🗑️  Cleaning TypeScript build info...${NC}"
rm -f tsconfig.tsbuildinfo
echo -e "${GREEN}✅ TypeScript build info cleaned${NC}"

# Clean ESLint cache
echo -e "${YELLOW}🗑️  Cleaning ESLint cache...${NC}"
rm -f .eslintcache
echo -e "${GREEN}✅ ESLint cache cleaned${NC}"

# Reinstall dependencies
echo -e "${YELLOW}📦 Reinstalling dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies reinstalled${NC}"

# Generate fresh env.js
echo -e "${YELLOW}⚙️  Generating fresh env.js...${NC}"
npm run env:generate -- --env=development
echo -e "${GREEN}✅ Fresh env.js generated${NC}"

echo -e "\n${GREEN}🎉 Clean build process completed successfully!${NC}"
echo -e "\n${BLUE}📋 What was cleaned:${NC}"
echo -e "   ✅ Next.js build artifacts (.next, out)"
echo -e "   ✅ Node modules cache"
echo -e "   ✅ NPM cache"
echo -e "   ✅ TypeScript build info"
echo -e "   ✅ ESLint cache"
echo -e "   ✅ Dependencies reinstalled"
echo -e "   ✅ Fresh env.js generated"

echo -e "\n${BLUE}🚀 Ready to start development:${NC}"
echo -e "   npm run dev"

echo -e "\n${BLUE}🔧 Or build for production:${NC}"
echo -e "   npm run build"
