import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectDocument extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  type: 'PRD' | 'User Stories' | 'Other';
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectDocumentSchema: Schema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true, maxlength: 150 },
    type: { type: String, enum: ['PRD', 'User Stories', 'Other'], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const ProjectDocument = mongoose.model<IProjectDocument>('ProjectDocument', ProjectDocumentSchema);
