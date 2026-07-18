import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  ownerId: mongoose.Types.ObjectId;
  title: string;
  tagline?: string;
  category: string;
  industry?: string;
  description: string;
  businessGoal?: string;
  targetAudience?: string;
  budget?: number;
  timeline?: string;
  tags?: string[];
  visibility: 'private' | 'public';
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, maxlength: 100 },
    tagline: { type: String, maxlength: 200 },
    category: { type: String, required: true },
    industry: { type: String },
    description: { type: String, required: true },
    businessGoal: { type: String },
    targetAudience: { type: String },
    budget: { type: Number, min: 0 },
    timeline: { type: String },
    tags: [{ type: String }],
    visibility: { type: String, enum: ['private', 'public'], default: 'private' },
    coverImage: { type: String },
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
