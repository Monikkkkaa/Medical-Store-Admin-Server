const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Create logs directory structure
const logsDir = path.join(__dirname, '../../logs');

// Success logs transport
const successTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'success', 'success-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '10m',
  maxFiles: '10d',
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

// Error logs transport
const errorTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '10m',
  maxFiles: '10d',
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

// Create logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    successTransport,
    errorTransport
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Helper methods
const logSuccess = (message, meta = {}) => {
  logger.info(message, { type: 'SUCCESS', ...meta });
};

const logError = (message, error = null, meta = {}) => {
  logger.error(message, { 
    type: 'ERROR', 
    error: error ? error.stack || error.message || error : null,
    ...meta 
  });
};

module.exports = {
  logger,
  logSuccess,
  logError
};