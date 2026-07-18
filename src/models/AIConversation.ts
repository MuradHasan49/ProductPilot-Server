import mongoose, { Schema, Document } from 'mongoose';

export interface IAIConversation extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  message: string;
  role: 'user' | 'assistant' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

const AIConversationSchema: Schema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  },
  { timestamps: true }
);

export const AIConversation = mongoose.model<IAIConversation>('AIConversation', AIConversationSchema);
