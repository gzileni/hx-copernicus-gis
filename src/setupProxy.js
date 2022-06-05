const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {

    const geoservices = {
        target: 'http://localhost:3002', 
        changeOrigin: true
    };

    const copernicus = {
        target: 'http://localhost:3003', 
        changeOrigin: true
    }
    
    app.use('/gs', createProxyMiddleware(geoservices));
    app.use('/copernicus', createProxyMiddleware(copernicus));
}