import { Project } from '../models/Project';
import { ProjectFeature } from '../models/ProjectFeature';
import { AIConversation } from '../models/AIConversation';

export const loadProjectContext = async (projectId: string, userId: string) => {
  const project = await Project.findOne({ _id: projectId, ownerId: userId });
  if (!project) return null;

  return `
    Project Title: ${project.title}
    Category: ${project.category}
    Audience: ${project.targetAudience || 'N/A'}
    Description: ${project.description}
    Business Goal: ${project.businessGoal || 'N/A'}
  `;
};

export const loadFeaturesContext = async (projectId: string) => {
  const features = await ProjectFeature.find({ projectId });
  if (!features || features.length === 0) return null;

  return features.map(f => `
    Feature: ${f.title}
    Description: ${f.description || ''}
    Priority: ${f.priority}
  `).join('\n');
};

export const loadChatHistory = async (projectId: string) => {
  const messages = await AIConversation.find({ projectId }).sort({ createdAt: 1 }).limit(10);
  if (!messages || messages.length === 0) return null;

  return messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.message}`).join('\n');
};
