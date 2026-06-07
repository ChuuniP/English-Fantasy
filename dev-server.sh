#!/bin/bash

# English Fantasy - Local Development Server Starter
# This script helps start a local web server for development

echo "🎮 English Fantasy - Development Server"
echo "========================================"
echo ""

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "🐍 Starting with Python 3..."
    cd "$(dirname "$0")"
    python3 -m http.server 8000 --directory src
    echo "✅ Server running at: http://localhost:8000/html/index.html"
elif command -v python &> /dev/null; then
    echo "🐍 Starting with Python..."
    cd "$(dirname "$0")"
    python -m SimpleHTTPServer 8000
    echo "✅ Server running at: http://localhost:8000/src/html/index.html"
elif command -v node &> /dev/null; then
    echo "📦 Starting with Node.js http-server..."
    cd "$(dirname "$0")"
    npx http-server src -p 8000 -c-1
    echo "✅ Server running at: http://localhost:8000/html/index.html"
else
    echo "❌ No suitable server found!"
    echo "Please install one of:"
    echo "  - Python 3.x (recommended)"
    echo "  - Python 2.x"
    echo "  - Node.js"
    exit 1
fi
