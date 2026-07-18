import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";

export let auth: any = null;

// We use a function to initialize auth so we can pass the MongoDB db instance
// after Mongoose has successfully connected.
export const initializeAuth = (db: any) => {
  auth = betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    trustedOrigins: [process.env.CLIENT_URL || "http://localhost:3000"],
  });
  return auth;
};
