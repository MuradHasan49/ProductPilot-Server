import express, { Request, Response, NextFunction } from 'express';
import mongoose, { Schema, Document } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'launchpilot_super_secret_key_32_chars';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/launchpilot';

// ============================================================
// SECTION: Global Middleware
// ============================================================
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: CLIENT_URL,
    credentials: true
}));

// ============================================================
// SECTION: Mongoose Models
// ============================================================

// --- User Model ---
interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: 'founder' | 'admin';
    googleId?: string;
    createdAt: Date;
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['founder', 'admin'], default: 'founder' },
    googleId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model<IUser>('User', userSchema);

// --- Startup Model ---
interface IStartup extends Document {
    founderId: mongoose.Types.ObjectId;
    ideaName: string;
    pitch: string;
    industry: string;
    status: 'planning' | 'launched';
    businessModel?: string; // AI generated markdown
    landingPageCopy?: string; // AI generated markdown
    riskScore?: number;
    createdAt: Date;
}

const startupSchema = new Schema<IStartup>({
    founderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ideaName: { type: String, required: true },
    pitch: { type: String, required: true },
    industry: { type: String, required: true },
    status: { type: String, enum: ['planning', 'launched'], default: 'planning' },
    businessModel: { type: String },
    landingPageCopy: { type: String },
    riskScore: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

const Startup = mongoose.model<IStartup>('Startup', startupSchema);

// --- Milestone Model ---
interface IMilestone extends Document {
    startupId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    isCompleted: boolean;
    dueDate?: Date;
    createdAt: Date;
}

const milestoneSchema = new Schema<IMilestone>({
    startupId: { type: Schema.Types.ObjectId, ref: 'Startup', required: true },
    title: { type: String, required: true },
    description: { type: String },
    isCompleted: { type: Boolean, default: false },
    dueDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

const Milestone = mongoose.model<IMilestone>('Milestone', milestoneSchema);

// --- ChatHistory Model ---
interface IChatMessage {
    role: 'user' | 'model';
    content: string;
    timestamp: Date;
}

interface IChatHistory extends Document {
    startupId: mongoose.Types.ObjectId;
    messages: IChatMessage[];
    createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
    role: { type: String, enum: ['user', 'model'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const chatHistorySchema = new Schema<IChatHistory>({
    startupId: { type: Schema.Types.ObjectId, ref: 'Startup', required: true },
    messages: [chatMessageSchema],
    createdAt: { type: Date, default: Date.now }
});

const ChatHistory = mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);

// ============================================================
// SECTION: Auth Middleware
// ============================================================
const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = req.cookies.cf_token;
        if (!token) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string, role: string };
        (req as any).user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

// ============================================================
// SECTION: Root Route
// ============================================================
app.get('/', (req: Request, res: Response) => {
    res.status(200).send('LaunchPilot API is running perfectly! 🚀');
});

// ============================================================
// SECTION: Auth Routes POST /api/auth/register | /login | /me
// ============================================================
app.post('/api/auth/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: 'All fields are required' });
            return;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'Email already in use' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await User.create({ name, email, passwordHash, role: 'founder' });

        const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

        res.cookie('cf_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({ success: true, data: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password are required' });
            return;
        }

        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.cookie('cf_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/auth/logout', (req: Request, res: Response): void => {
    res.clearCookie('cf_token');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/me', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const user = await User.findById(userId).select('-passwordHash');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, data: user });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// SECTION: Startup Routes
// ============================================================
app.get('/api/startups', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const startups = await Startup.find({ founderId: userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: startups });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/startups/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const startup = await Startup.findOne({ _id: req.params.id, founderId: userId });
        if (!startup) {
            res.status(404).json({ success: false, message: 'Startup not found' });
            return;
        }
        res.status(200).json({ success: true, data: startup });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/startups', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { ideaName, pitch, industry } = req.body;

        if (!ideaName || !pitch || !industry) {
            res.status(400).json({ success: false, message: 'ideaName, pitch, and industry are required' });
            return;
        }

        const newStartup = await Startup.create({
            founderId: userId,
            ideaName,
            pitch,
            industry
        });

        res.status(201).json({ success: true, data: newStartup });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.patch('/api/startups/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const updates = req.body;

        const startup = await Startup.findOneAndUpdate(
            { _id: req.params.id, founderId: userId },
            { $set: updates },
            { new: true }
        );

        if (!startup) {
            res.status(404).json({ success: false, message: 'Startup not found' });
            return;
        }

        res.status(200).json({ success: true, data: startup });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/startups/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const startup = await Startup.findOneAndDelete({ _id: req.params.id, founderId: userId });

        if (!startup) {
            res.status(404).json({ success: false, message: 'Startup not found' });
            return;
        }

        await Milestone.deleteMany({ startupId: startup._id });
        await ChatHistory.deleteMany({ startupId: startup._id });

        res.status(200).json({ success: true, message: 'Startup deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// SECTION: Milestone Routes
// ============================================================
app.get('/api/milestones/:startupId', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { startupId } = req.params;

        const startup = await Startup.findOne({ _id: startupId, founderId: userId });
        if (!startup) {
            res.status(404).json({ success: false, message: 'Startup not found' });
            return;
        }

        const milestones = await Milestone.find({ startupId }).sort({ dueDate: 1 });
        res.status(200).json({ success: true, data: milestones });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/milestones', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { startupId, title, description, dueDate } = req.body;

        if (!startupId || !title) {
            res.status(400).json({ success: false, message: 'startupId and title are required' });
            return;
        }

        const startup = await Startup.findOne({ _id: startupId, founderId: userId });
        if (!startup) {
            res.status(404).json({ success: false, message: 'Startup not found' });
            return;
        }

        const newMilestone = await Milestone.create({
            startupId,
            title,
            description,
            dueDate
        });

        res.status(201).json({ success: true, data: newMilestone });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.patch('/api/milestones/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const updates = req.body;
        const milestoneId = req.params.id;

        const milestone = await Milestone.findById(milestoneId);
        if (!milestone) {
            res.status(404).json({ success: false, message: 'Milestone not found' });
            return;
        }

        const startup = await Startup.findOne({ _id: milestone.startupId, founderId: userId });
        if (!startup) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }

        const updatedMilestone = await Milestone.findByIdAndUpdate(milestoneId, { $set: updates }, { new: true });
        res.status(200).json({ success: true, data: updatedMilestone });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/milestones/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const milestoneId = req.params.id;

        const milestone = await Milestone.findById(milestoneId);
        if (!milestone) {
            res.status(404).json({ success: false, message: 'Milestone not found' });
            return;
        }

        const startup = await Startup.findOne({ _id: milestone.startupId, founderId: userId });
        if (!startup) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }

        await Milestone.findByIdAndDelete(milestoneId);
        res.status(200).json({ success: true, message: 'Milestone deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// SECTION: AI Agent Routes
// ============================================================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');

app.post('/api/ai/generate-content', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { startupId, type, tone, length } = req.body;

        if (!startupId || !type) {
            res.status(400).json({ success: false, message: 'startupId and type are required' });
            return;
        }

        const startup = await Startup.findOne({ _id: startupId, founderId: userId });
        if (!startup) {
            res.status(404).json({ success: false, message: 'Startup not found' });
            return;
        }

        let promptTemplate = '';
        if (type === 'businessModel') {
            promptTemplate = `You are an expert startup advisor. Generate a lean canvas business model for a startup named "${startup.ideaName}" in the ${startup.industry} industry. The pitch is: "${startup.pitch}". Keep the tone ${tone || 'professional'} and length ${length || 'medium'}. Provide output in clean markdown.`;
        } else if (type === 'landingPage') {
            promptTemplate = `You are an expert copywriter. Write a highly converting landing page copy for a startup named "${startup.ideaName}" in the ${startup.industry} industry. The pitch is: "${startup.pitch}". Keep the tone ${tone || 'persuasive'} and length ${length || 'medium'}. Include a Hero section, Features, and Call to Action. Provide output in clean markdown.`;
        } else {
            res.status(400).json({ success: false, message: 'Invalid content type' });
            return;
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const result = await model.generateContent(promptTemplate);
        const text = result.response.text();

        if (type === 'businessModel') {
            startup.businessModel = text;
        } else {
            startup.landingPageCopy = text;
        }
        await startup.save();

        res.status(200).json({ success: true, data: text });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/ai/recommendations/:startupId', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { startupId } = req.params;

        const startup = await Startup.findOne({ _id: startupId, founderId: userId });
        if (!startup) {
            res.status(404).json({ success: false, message: 'Startup not found' });
            return;
        }

        const prompt = `You are an expert startup consultant. Analyze this startup:
        Name: ${startup.ideaName}
        Industry: ${startup.industry}
        Pitch: ${startup.pitch}
        
        Please provide:
        1. 3 Recommended Pricing Strategies.
        2. Top 3 Business Risks and mitigation tactics.
        3. A suggested "Risk Score" out of 100 (where 100 is highly risky, 0 is no risk). Only output the number for the score.
        
        Format as JSON: { "pricing": [], "risks": [], "riskScore": number }`;

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const result = await model.generateContent(prompt);
        let text = result.response.text();

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);

        startup.riskScore = parsed.riskScore;
        await startup.save();

        res.status(200).json({ success: true, data: parsed });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/ai/chat', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { startupId, message } = req.body;

        if (!startupId || !message) {
            res.status(400).json({ success: false, message: 'startupId and message are required' });
            return;
        }

        const startup = await Startup.findOne({ _id: startupId, founderId: userId });
        if (!startup) {
            res.status(404).json({ success: false, message: 'Startup not found' });
            return;
        }

        let chatHistory = await ChatHistory.findOne({ startupId });
        if (!chatHistory) {
            chatHistory = new ChatHistory({ startupId, messages: [] });
        }

        chatHistory.messages.push({ role: 'user', content: message, timestamp: new Date() });

        const historyForGemini = chatHistory.messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const chat = model.startChat({
            history: historyForGemini.slice(0, -1),
            systemInstruction: { role: 'system', parts: [{ text: `You are an AI Co-Founder assistant. You are helping the founder with their startup: ${startup.ideaName}. Industry: ${startup.industry}. Pitch: ${startup.pitch}. Be helpful, concise, and professional.` }] }
        });

        const result = await chat.sendMessage(message);
        const aiResponse = result.response.text();

        chatHistory.messages.push({ role: 'model', content: aiResponse, timestamp: new Date() });
        await chatHistory.save();

        res.status(200).json({ success: true, data: { response: aiResponse, history: chatHistory.messages } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// SECTION: Error Handler
// ============================================================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// ============================================================
// SECTION: Server Initialization
// ============================================================
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    });
