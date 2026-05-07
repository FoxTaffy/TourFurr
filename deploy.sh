#!/bin/bash
set -e

echo "=== TourFurr Deploy ==="

DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"

# Load .env if it exists so VITE_SUPABASE_URL and friends are available
if [ -f "${DEPLOY_DIR}/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "${DEPLOY_DIR}/.env"
  set +a
fi

# The proxy server needs SUPABASE_URL; fall back to the Vite build var
export SUPABASE_URL="${SUPABASE_URL:-$VITE_SUPABASE_URL}"

if [ -z "$SUPABASE_URL" ]; then
  echo "ERROR: SUPABASE_URL (or VITE_SUPABASE_URL) must be set before deploying." >&2
  exit 1
fi

# Pull latest code
echo "[1/6] Pulling latest code..."
git pull origin main

# Install frontend dependencies
echo "[2/6] Installing frontend dependencies..."
npm install

# Build frontend
echo "[3/6] Building frontend..."
npm run build

# Install proxy server runtime dependencies into project node_modules
echo "[4/6] Installing proxy server dependencies..."
npm install --no-save express cors express-http-proxy morgan

# Start or restart proxy server via PM2
echo "[5/6] Starting proxy server via PM2..."
pm2 startOrRestart "${DEPLOY_DIR}/ecosystem.config.js" --update-env
pm2 save

# Install nginx config with the correct document root, then reload
echo "[6/6] Installing nginx config and reloading..."
sed "s|root /usr/share/nginx/html;|root ${DEPLOY_DIR}/dist;|" \
  "${DEPLOY_DIR}/nginx.conf" \
  | sudo tee /etc/nginx/sites-available/tourfurr > /dev/null
sudo ln -sf /etc/nginx/sites-available/tourfurr /etc/nginx/sites-enabled/tourfurr
# Disable the default vhost so it doesn't shadow our server block
sudo rm -f /etc/nginx/sites-enabled/default
nginx -t && sudo systemctl reload nginx

echo ""
echo "=== Deploy complete! ==="
