#!/bin/sh
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
pm2 startOrRestart "${DEPLOY_DIR}/ecosystem.config.cjs" --update-env
pm2 save

# ── Nginx config ──────────────────────────────────────────────────────────────
echo "[6/6] Installing nginx config and reloading..."

# Auto-detect which Let's Encrypt cert domain to use (prefer bare domain)
if [ -d "/etc/letsencrypt/live/tourfurr.camp" ]; then
  CERT_DOMAIN="tourfurr.camp"
elif [ -d "/etc/letsencrypt/live/www.tourfurr.camp" ]; then
  CERT_DOMAIN="www.tourfurr.camp"
else
  echo "WARNING: Let's Encrypt cert not found under /etc/letsencrypt/live/" >&2
  echo "         Set CERT_DOMAIN manually and re-run step 6 if needed." >&2
  CERT_DOMAIN="tourfurr.camp"
fi

# Generate the production nginx config from the template
sed \
  -e "s|DEPLOY_ROOT|${DEPLOY_DIR}|g" \
  -e "s|CERT_DOMAIN|${CERT_DOMAIN}|g" \
  "${DEPLOY_DIR}/nginx.production.conf" \
  | sudo tee /etc/nginx/sites-available/tourfurr.camp > /dev/null

# Enable our config and disable anything that might shadow it
sudo ln -sf /etc/nginx/sites-available/tourfurr.camp \
            /etc/nginx/sites-enabled/tourfurr.camp
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "=== Deploy complete! ==="
