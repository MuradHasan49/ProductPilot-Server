import mongoose, { Schema, Document } from 'mongoose';

export interface ISprintPlan extends Document {
  projectId: mongoose.Types.ObjectId;
  sprintName: string;
  goal?: string;
  startDate?: Date;
  endDate?: Date;
  tasks: {
    title: string;
    status: 'todo' | 'in-progress' | 'done';
    assignee?: string;
  }[];
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SprintPlanSchema: Schema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    sprintName: { type: String, required: true },
    goal: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    tasks: [
      {
        title: { type: String, required: true },
        status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
        assignee: { type: String },
      },
    ],
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SprintPlan = mongoose.model<ISprintPlan>('SprintPlan', SprintPlanSchema);
