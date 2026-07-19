import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User';

const generateToken = (id: string, role: string, email: string) => {
  return jwt.sign({ id, role, email }, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  });
};

const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const token = generateToken(user._id.toString(), user.role, user.email);

  res.cookie('pp_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(statusCode).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, avatar } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('pp_token', { httpOnly: true, sameSite: 'lax' });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, avatar } = req.body;
    
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not connected' });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (avatar !== undefined) updateData.image = avatar;

    const result = await db.collection('user').findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(req.user.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedUser = {
      ...result,
      avatar: result.image
    };
    
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    next(error);
  }
};
