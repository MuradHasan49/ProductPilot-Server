import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { toNodeHandler } from 'better-auth/node';
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

// Connect to MongoDB and start server
const startServer = async () => {
    await connectDB();

    // Initialize Better Auth with the native mongodb instance
    const auth = initializeAuth(mongoose.connection.db);

    // Mount Better Auth handler safely bypassing Express 5 path-to-regexp limitations
    app.use((req, res, next) => {
        if (req.url.startsWith('/api/auth')) {
            return toNodeHandler(auth)(req, res);
        }
        next();
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

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`🚀 Server initialized and running on port ${PORT}`);
    });
};

startServer();