import mongoose, { Schema, Document } from 'mongoose';

export interface IRoadmap extends Document {
  projectId: mongoose.Types.ObjectId;
  milestone: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapSchema: Schema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    milestone: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ['planned', 'in-progress', 'completed', 'delayed'], default: 'planned' },
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Roadmap = mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
