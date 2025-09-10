#!/bin/bash

# Node.js Version Verification Script
# This script checks if the local Node.js version meets Angular requirements

echo "🔍 Checking Node.js version compatibility..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Get current Node.js version
NODE_VERSION=$(node --version)
echo "📦 Current Node.js version: $NODE_VERSION"

# Extract major version number
MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
MINOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f2)

echo "🔢 Major version: $MAJOR_VERSION"
echo "🔢 Minor version: $MINOR_VERSION"

# Check if version meets Angular requirements
if [ "$MAJOR_VERSION" -ge 22 ]; then
    echo "✅ Node.js v22+ detected - Compatible with Angular CLI"
    exit 0
elif [ "$MAJOR_VERSION" -eq 20 ] && [ "$MINOR_VERSION" -ge 19 ]; then
    echo "✅ Node.js v20.19+ detected - Compatible with Angular CLI"
    exit 0
elif [ "$MAJOR_VERSION" -eq 20 ] && [ "$MINOR_VERSION" -lt 19 ]; then
    echo "⚠️  Node.js v20.$MINOR_VERSION detected - Please upgrade to v20.19+ or v22+"
    echo "   Current: $NODE_VERSION"
    echo "   Required: v20.19+ or v22+"
    exit 1
else
    echo "❌ Node.js version too old - Angular CLI requires v20.19+ or v22+"
    echo "   Current: $NODE_VERSION"
    echo "   Required: v20.19+ or v22+"
    echo ""
    echo "📥 Please update Node.js:"
    echo "   - Visit: https://nodejs.org/"
    echo "   - Download the latest LTS version"
    echo "   - Or use nvm: nvm install 20 && nvm use 20"
    exit 1
fi
