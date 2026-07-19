import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { initializeAuth } from './auth';

import projectRoutes from './routes/project.routes';
import aiRoutes from './routes/ai.routes';
import analyticsRoutes from './routes/analytics.routes';
import dashboardRoutes from './routes/dashboard.routes';
import userRoutes from './routes/auth.routes';

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

let auth: any = null;

// Middleware to ensure DB and Auth are initialized before handling requests on serverless
app.use(async (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        await connectDB();
    }
    if (!auth && mongoose.connection.db) {
        auth = await initializeAuth(mongoose.connection.db);
    }
    next();
});

const dynamicImport = new Function('specifier', 'return import(specifier)');

// Mount Better Auth handler safely bypassing Express 5 path-to-regexp limitations
app.use(async (req, res, next) => {
    if (req.url.startsWith('/api/auth') && auth) {
        try {
            const module = await dynamicImport('better-auth/node');
            return module.toNodeHandler(auth)(req, res);
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to ProductPilot AI API 🚀 ');
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'ProductPilot AI Server is running!' });
});

// Global Error Handler
app.use(errorHandler);

// Only listen if not running in a serverless environment like Vercel
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, async () => {
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
            if (!auth && mongoose.connection.db) {
                auth = await initializeAuth(mongoose.connection.db);
            }
        }
        console.log(`🚀 Server initialized and running on port ${PORT}`);
    });
}

export default app;