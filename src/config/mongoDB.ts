import mongoose from 'mongoose';

const mongoUrl = 'mongodb://localhost:27017/testdb';

export const connectToMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};