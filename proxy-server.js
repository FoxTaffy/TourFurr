const express = require('express');
const cors = require('cors');
const httpProxy = require('express-http-proxy');
const logger = require('morgan');

const app = express();
const port = process.env.PROXY_PORT || 3001;

// Middleware
app.use(logger('combined'));
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey', 'x-client-info']
}));

// Get Supabase URL from environment
const supabaseUrl = process.env.SUPABASE_URL;

if (!supabaseUrl) {
  console.error('ERROR: SUPABASE_URL environment variable is not set');
  process.exit(1);
}

console.log(`🔄 Proxy server started on port ${port}`);
console.log(`📍 Proxying requests to: ${supabaseUrl}`);

// Proxy all requests to Supabase
app.use('/api', httpProxy(supabaseUrl, {
  proxyReqPathResolver: (req) => {
    // Remove /api prefix and pass the rest to Supabase
    return req.originalUrl.replace(/^\/api/, '');
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    // Pass through important headers
    proxyReqOpts.headers = proxyReqOpts.headers || {};
    
    // Copy auth headers
    if (srcReq.headers.authorization) {
      proxyReqOpts.headers.authorization = srcReq.headers.authorization;
    }
    if (srcReq.headers.apikey) {
      proxyReqOpts.headers.apikey = srcReq.headers.apikey;
    }
    if (srcReq.headers['x-client-info']) {
      proxyReqOpts.headers['x-client-info'] = srcReq.headers['x-client-info'];
    }
    
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    // Add CORS headers to response
    userRes.setHeader('Access-Control-Allow-Origin', '*');
    userRes.setHeader('Access-Control-Allow-Credentials', 'true');
    return proxyResData;
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', proxy: supabaseUrl });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Proxy server listening on port ${port}`);
});
