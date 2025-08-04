#!/bin/bash

echo "🔧 Fixing Vite permissions and cleaning cache..."

# Remove Vite cache directories
echo "Removing Vite cache..."
rm -rf node_modules/.vite*
rm -rf .vite
rm -rf dist

# Fix permissions for the project directory
echo "Fixing permissions..."
chmod -R 755 .
chmod -R 755 node_modules 2>/dev/null || true

# Create a new .vite directory with proper permissions
echo "Creating .vite directory with proper permissions..."
mkdir -p .vite
chmod 755 .vite

echo "✅ Permissions fixed! Try running 'npm run dev' again."