const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

const fixOrderIndexes = async () => {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    const collection = db.collection('orders');
    
    // Get all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);
    
    // Drop the problematic orderNumber index if it exists
    try {
      await collection.dropIndex('orderNumber_1');
      console.log('Dropped orderNumber_1 index');
    } catch (error) {
      console.log('orderNumber_1 index does not exist or already dropped');
    }
    
    // Remove any documents with null orderNumber
    const result = await collection.deleteMany({ orderNumber: null });
    console.log(`Removed ${result.deletedCount} documents with null orderNumber`);
    
    console.log('Index fix completed successfully');
    
  } catch (error) {
    console.error('Error fixing indexes:', error);
  } finally {
    mongoose.connection.close();
  }
};

fixOrderIndexes();