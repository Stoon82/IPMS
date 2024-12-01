const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    console.log('[Proxy] Setting up proxy middleware...');
    
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://localhost:8000',
            changeOrigin: true,
            logLevel: 'debug',
            onProxyReq: (proxyReq, req, res) => {
                console.log('[Proxy] Proxying request:', {
                    method: req.method,
                    path: req.path,
                    url: req.url,
                    headers: req.headers
                });
            },
            onProxyRes: (proxyRes, req, res) => {
                console.log('[Proxy] Received response:', {
                    statusCode: proxyRes.statusCode,
                    path: req.path,
                    headers: proxyRes.headers
                });
            },
            onError: (err, req, res) => {
                console.error('[Proxy] Error:', err);
            }
        })
    );
    
    console.log('[Proxy] Proxy middleware setup complete');
};