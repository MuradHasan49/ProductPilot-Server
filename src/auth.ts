export let auth: any = null;

const dynamicImport = new Function('specifier', 'return import(specifier)');

// We use a function to initialize auth so we can pass the MongoDB db instance
// after Mongoose has successfully connected.
export const initializeAuth = async (db: any) => {
  const { betterAuth } = await dynamicImport('better-auth');
  const { mongodbAdapter } = await dynamicImport('better-auth/adapters/mongodb');

  auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8000",
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
    advanced: {
      useSecureCookies: true, // required for SameSite=None
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
      }
    }
  });
  return auth;
};
