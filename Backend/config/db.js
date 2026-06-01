import { connect } from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart_placement', {
      serverSelectionTimeoutMS: 5000 // Timeout connection attempts after 5 seconds instead of hanging
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;