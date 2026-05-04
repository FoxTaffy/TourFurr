#!/bin/sh
set -e

# Start proxy server in background
export SUPABASE_URL=${VITE_SUPABASE_URL}
export PROXY_PORT=3001

echo "🔄 Starting Supabase proxy server..."
node /proxy/proxy-server.js &
PROXY_PID=$!

echo "✅ Starting Nginx..."
# Start nginx in foreground
exec nginx -g "daemon off;"
