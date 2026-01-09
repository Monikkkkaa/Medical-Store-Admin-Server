const { logSuccess, logError } = require('../utils/logger');

const loggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logSuccess('HTTP Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Override res.json to log responses
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    if (res.statusCode >= 400) {
      logError('HTTP Error Response', null, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        response: data,
        ip: req.ip
      });
    } else {
      logSuccess('HTTP Success Response', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip
      });
    }
    
    return originalJson.call(this, data);
  };

  next();
};

module.exports = loggingMiddleware;