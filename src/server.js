const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config');
const Admin = require('./models/Admin.model');
const { logSuccess, logError } = require('./utils/logger');

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    logSuccess('Database connected successfully');

    // Create default admin if not exists
    const adminExists = await Admin.findOne({ email: config.ADMIN_EMAIL });
    if (!adminExists) {
      const admin = new Admin({
        email: config.ADMIN_EMAIL,
        password: config.ADMIN_PASSWORD,
      });
      await admin.save();
      logSuccess('Default admin created', { email: config.ADMIN_EMAIL });
    }

    // Start server
    const PORT = config.PORT;
    app.listen(PORT, () => {
      logSuccess('Server started successfully', {
        port: PORT,
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString()
      });
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${config.NODE_ENV}`);
    });
  } catch (error) {
    logError('Failed to start server', error);
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError('Uncaught Exception', error);
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection', reason, { promise: promise.toString() });
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

startServer();