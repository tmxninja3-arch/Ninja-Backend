const mongoose = require('mongoose');

let isConnected = false; // Track connection status

const connectDB = async () => {
  // ✅ If already connected, reuse connection
  if (isConnected) {
    console.log('📦 Using existing MongoDB connection');
    return;
  }

  try {
    // ✅ MongoDB connection with updated options
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    // Don't exit in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;