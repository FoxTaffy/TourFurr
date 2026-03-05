#!/bin/bash
set -e

echo "=== TourFurr Deploy ==="

# Pull latest code
echo "[1/4] Pulling latest code..."
git pull origin main

# Install dependencies
echo "[2/4] Installing dependencies..."
npm install

# Build
echo "[3/4] Building..."
npm run build

# Reload nginx + restart PM2
echo "[4/4] Reloading nginx & PM2..."
nginx -t && systemctl reload nginx

echo ""
echo "=== Deploy complete! ==="
