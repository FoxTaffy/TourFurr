#!/bin/bash
set -e

echo "=== TourFurr Deploy ==="

# Pull latest code
echo "[1/3] Pulling latest code..."
git pull origin main

# Build and restart container
echo "[2/3] Building Docker image..."
docker compose build --no-cache

echo "[3/3] Restarting container..."
docker compose up -d

echo ""
echo "=== Deploy complete! ==="
echo "Site running on port 3000"
echo "Use a reverse proxy (nginx/caddy) to serve on port 443 with SSL"
