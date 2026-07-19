import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected");
    const db = mongoose.connection.db;
    if (!db) return;
    
    // Check both collections
    const usersBetterAuth = await db.collection('user').find().toArray();
    console.log("BETTER AUTH USERS:", usersBetterAuth.length, usersBetterAuth.map(u => u._id));
    
    const usersMongoose = await db.collection('users').find().toArray();
    console.log("MONGOOSE USERS:", usersMongoose.length, usersMongoose.map(u => u._id));
    
    process.exit(0);
  } catch (err) {
    console.error("DB ERR", err);
    process.exit(1);
  }
};

test();
