import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectFeature extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed';
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectFeatureSchema: Schema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true },
    description: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ProjectFeature = mongoose.model<IProjectFeature>('ProjectFeature', ProjectFeatureSchema);
