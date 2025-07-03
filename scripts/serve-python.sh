#!/bin/bash

# Python static server script
# This script uses Python's built-in HTTP server to serve static files

PORT=${1:-8000}
DIST_DIR="./dist"

echo "🚀 Starting Python static server..."
echo "📁 Serving files from: $DIST_DIR"
echo "🔗 Server will be available at: http://localhost:$PORT"
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

# Check if dist directory exists
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ Error: $DIST_DIR directory not found!"
    echo "💡 Run 'npm run build:deploy' first to generate the files"
    exit 1
fi

# Change to dist directory and start server
cd "$DIST_DIR"

# Check Python version and use appropriate command
if command -v python3 &> /dev/null; then
    echo "🐍 Using Python 3..."
    python3 -m http.server "$PORT"
elif command -v python &> /dev/null; then
    echo "🐍 Using Python..."
    python -m http.server "$PORT"
else
    echo "❌ Error: Python not found!"
    echo "💡 Please install Python or use 'npm run serve:static' instead"
    exit 1
fi 