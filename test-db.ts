import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("Connected");
  const db = mongoose.connection.db;
  if (!db) return;
  const users = await db.collection('user').find().toArray();
  console.log("USERS IN DB:", JSON.stringify(users, null, 2));
  process.exit(0);
};

test();
