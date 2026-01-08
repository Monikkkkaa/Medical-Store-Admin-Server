const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('./src/models/Admin.model');

const createAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Clear existing admins
    await Admin.deleteMany({});

    // Create first admin
    const hashedPassword1 = await bcrypt.hash('admin123', 12);
    const admin1 = new Admin({
      email: 'admin@medicalstore.com',
      password: hashedPassword1,
      role: 'admin',
    });
    await admin1.save();

    // Create second admin
    const hashedPassword2 = await bcrypt.hash('cool@1234', 12);
    const admin2 = new Admin({
      email: 'cooladmin@gmail.com',
      password: hashedPassword2,
      role: 'admin',
    });
    await admin2.save();

    console.log('✅ Admins created successfully!');
    console.log('Admin 1: admin@medicalstore.com | admin123');
    console.log('Admin 2: cooladmin@gmail.com | cool@1234');

  } catch (error) {
    console.error('Error creating admins:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmins();