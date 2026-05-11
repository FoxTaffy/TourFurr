#!/bin/sh
set -e

# SUPABASE_URL is set from Dockerfile ENV (build-time VITE_SUPABASE_URL),
# but can be overridden at runtime: docker run -e SUPABASE_URL=https://...
export PROXY_PORT=3001

if [ -z "$SUPABASE_URL" ]; then
  echo "ERROR: SUPABASE_URL is not set. Pass it as a build arg or runtime env var." >&2
  exit 1
fi

echo "🔄 Starting Supabase proxy server (target: $SUPABASE_URL)..."
node /proxy/proxy-server.js &

echo "✅ Starting Nginx..."
exec nginx -g "daemon off;"
