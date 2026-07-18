import mongoose, { Schema, Document } from 'mongoose';

export interface IAIGeneration extends Document {
  projectId: mongoose.Types.ObjectId;
  agent: string;
  prompt: string;
  response: string;
  tokenUsage?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AIGenerationSchema: Schema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    agent: { type: String, required: true },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    tokenUsage: { type: Number },
  },
  { timestamps: true }
);

export const AIGeneration = mongoose.model<IAIGeneration>('AIGeneration', AIGenerationSchema);
