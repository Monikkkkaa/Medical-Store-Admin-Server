const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config');
const Admin = require('./models/Admin.model');

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Create default admin if not exists
    const adminExists = await Admin.findOne({ email: config.ADMIN_EMAIL });
    if (!adminExists) {
      const admin = new Admin({
        email: config.ADMIN_EMAIL,
        password: config.ADMIN_PASSWORD,
      });
      await admin.save();
      console.log('Default admin created');
    }

    // Start server
    const PORT = config.PORT;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${config.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();