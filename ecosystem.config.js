module.exports = {
  apps: [{
    name: 'tourfurr-proxy',
    script: 'proxy-server.js',
    env: {
      NODE_ENV: 'production',
      PROXY_PORT: '3001',
      SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
    }
  }]
}
