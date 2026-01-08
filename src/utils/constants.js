const ORDER_STATUS = {
  PENDING: 'Pending',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

const MESSAGES = {
  SUCCESS: 'Operation successful',
  UNAUTHORIZED: 'Access denied. No token provided',
  INVALID_TOKEN: 'Invalid token',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'Internal server error',
};

const LOW_STOCK_THRESHOLD = 10;

module.exports = {
  ORDER_STATUS,
  USER_ROLES,
  MESSAGES,
  LOW_STOCK_THRESHOLD,
};