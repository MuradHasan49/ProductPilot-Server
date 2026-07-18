import mongoose, { Schema, Document } from 'mongoose';

export interface IUserStory extends Document {
  projectId: mongoose.Types.ObjectId;
  story: string;
  acceptanceCriteria: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  storyPoints?: number;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserStorySchema: Schema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    story: { type: String, required: true },
    acceptanceCriteria: [{ type: String }],
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    storyPoints: { type: Number },
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserStory = mongoose.model<IUserStory>('UserStory', UserStorySchema);
