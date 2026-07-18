import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  projectId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  details?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema: Schema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    details: { type: String },
  },
  { timestamps: true }
);

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
