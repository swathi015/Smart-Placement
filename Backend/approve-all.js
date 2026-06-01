import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const approveAll = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_placement';
    console.log('Connecting to database:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // We can directly access the users collection to approve all accounts
    const db = mongoose.connection.db;
    const result = await db.collection('users').updateMany(
      { isApproved: false },
      { $set: { isApproved: true } }
    );

    console.log(`Successfully approved ${result.modifiedCount} pending user account(s).`);

    // Let's also check if there is an approved status on the companies collection
    const companyResult = await db.collection('companies').updateMany(
      { status: 'pending' },
      { $set: { status: 'approved' } }
    );
    console.log(`Successfully approved ${companyResult.modifiedCount} corporate profile(s).`);

  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
};

approveAll();
