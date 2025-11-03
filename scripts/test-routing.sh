#!/bin/bash

# Test Routing Script
# This script tests if the trailing slash configuration works correctly

set -e

echo "🧪 Testing Routing Configuration"
echo "================================"
echo ""

OUT_DIR="out"

# Check if out directory exists
if [ ! -d "$OUT_DIR" ]; then
    echo "❌ Build directory 'out' not found!"
    echo "   Run 'npm run build' first."
    exit 1
fi

echo "✅ Build directory found"
echo ""

# Test if index files exist in expected locations
echo "📁 Checking generated files:"
echo ""

# Root index
if [ -f "$OUT_DIR/index.html" ]; then
    echo "  ✅ /index.html"
else
    echo "  ❌ /index.html - MISSING"
fi

# Dashboard
if [ -f "$OUT_DIR/dashboard/index.html" ]; then
    echo "  ✅ /dashboard/index.html"
else
    echo "  ❌ /dashboard/index.html - MISSING"
fi

# Auth pages
if [ -f "$OUT_DIR/auth/login/index.html" ]; then
    echo "  ✅ /auth/login/index.html"
else
    echo "  ❌ /auth/login/index.html - MISSING"
fi

if [ -f "$OUT_DIR/auth/register/index.html" ]; then
    echo "  ✅ /auth/register/index.html"
else
    echo "  ❌ /auth/register/index.html - MISSING"
fi

if [ -f "$OUT_DIR/auth/forgot-password/index.html" ]; then
    echo "  ✅ /auth/forgot-password/index.html"
else
    echo "  ❌ /auth/forgot-password/index.html - MISSING"
fi

# Properties
if [ -f "$OUT_DIR/properties/index.html" ]; then
    echo "  ✅ /properties/index.html"
else
    echo "  ❌ /properties/index.html - MISSING"
fi

# Admin
if [ -f "$OUT_DIR/admin/users/index.html" ]; then
    echo "  ✅ /admin/users/index.html"
else
    echo "  ❌ /admin/users/index.html - MISSING"
fi

echo ""
echo "📊 Directory structure:"
echo ""
tree -L 3 -I 'node_modules|.next|cache|chunks|static|vendor-chunks' "$OUT_DIR" | head -30

echo ""
echo "✅ Routing configuration test complete!"
echo ""
echo "🚀 To test the server locally:"
echo "   node serve-static.js"
echo ""
echo "🧪 Then test these URLs in your browser:"
echo "   http://localhost:3000/"
echo "   http://localhost:3000/dashboard      (should redirect to /dashboard/)"
echo "   http://localhost:3000/dashboard/"
echo "   http://localhost:3000/auth/login/"
echo "   http://localhost:3000/properties/"
echo ""

