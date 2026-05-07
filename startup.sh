#!/bin/sh
set -e

export SUPABASE_URL=${VITE_SUPABASE_URL}
export PROXY_PORT=3001

echo "🔄 Starting Supabase proxy server..."
node /proxy/proxy-server.js &

# Wait until the proxy is accepting connections before nginx starts,
# otherwise the first /api/ requests may hit a closed port.
i=0
until wget -q -O- "http://localhost:3001/health" > /dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -ge 15 ]; then
    echo "❌ Proxy server failed to start within 15 seconds" >&2
    exit 1
  fi
  sleep 1
done
echo "✅ Proxy server is ready"

echo "✅ Starting Nginx..."
exec nginx -g "daemon off;"
