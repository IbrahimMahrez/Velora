const mongoose = require('mongoose');

// Fail fast instead of buffering operations forever:
// if the DB is unreachable the server refuses to boot
// with a clear message rather than crashing later on
// "buffering timed out" errors inside random requests.
const connectDB = async function () {
  if (!process.env.MONGO_URI) {
    throw new Error(
      'MONGO_URI is missing. Add it to server/.env'
    );
  }

  mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB...');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Retrying...');
  });

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
};

module.exports = connectDB;
