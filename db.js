const mongoose = require('mongoose');
require('dotenv').config();

const connectToDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    console.log('🛠 Connecting to MongoDB:', process.env.MONGO_URI);

    if (mongoose.connection.readyState === 1) {
      console.log('✅ Using existing database connection');
      return mongoose.connection.db; // ✅ Return the database object
    }

    await mongoose.connect(process.env.MONGO_URI,

      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    }
    );

    console.log('✅ MongoDB connected successfully');

    // 🔹 Fix: Return the connected database object
    return mongoose.connection.db; 
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return null; // 🔹 Ensure it doesn't crash the app
  }
};

module.exports = { connectToDatabase };
