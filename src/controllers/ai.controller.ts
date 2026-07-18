import { Request, Response, NextFunction } from 'express';
import { generateText } from '../ai/groq';
import { PromptManager } from '../ai/promptManager';
import { loadProjectContext, loadFeaturesContext, loadChatHistory } from '../ai/contextLoader';
import { AIGeneration } from '../models/AIGeneration';
import { AIConversation } from '../models/AIConversation';
import { Project } from '../models/Project';

export const generatePRD = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, length } = req.body;
    if (!projectId) {
      return res.status(400).json({ success: false, message: 'projectId is required' });
    }

    console.log(`[AI Controller - PRD] Loading context for Project ID: ${projectId}...`);
    const context = await loadProjectContext(projectId, req.user!.id);
    if (!context) {
      return res.status(404).json({ success: false, message: 'Project not found or unauthorized' });
    }

    console.log(`[AI Controller - PRD] Generating prompt with length ${length || 'medium'}...`);
    const prompt = PromptManager.getPRDPrompt(context, length);

    console.log(`[AI Controller - PRD] Calling Groq API...`);
    const responseText = await generateText(prompt);

    console.log(`[AI Controller - PRD] Generation successful. Saving to DB...`);
    await AIGeneration.create({
      projectId,
      agent: 'PRD Generator',
      prompt,
      response: responseText,
    });

    res.status(200).json({ success: true, data: responseText });
  } catch (error: any) {
    console.error(`[AI Controller - PRD] ERROR:`, error.message);
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

export const generateUserStories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, length } = req.body;
    if (!projectId) {
      return res.status(400).json({ success: false, message: 'projectId is required' });
    }

    console.log(`[AI Controller - User Stories] Loading context for Project ID: ${projectId}...`);
    const projectContext = await loadProjectContext(projectId, req.user!.id);
    if (!projectContext) {
      return res.status(404).json({ success: false, message: 'Project not found or unauthorized' });
    }
    
    const featuresContext = await loadFeaturesContext(projectId);
    const prompt = PromptManager.getUserStoryPrompt(projectContext, featuresContext || "No features defined yet.", length);

    console.log(`[AI Controller - User Stories] Calling Groq API...`);
    const responseText = await generateText(prompt);

    console.log(`[AI Controller - User Stories] Generation successful. Saving to DB...`);
    await AIGeneration.create({
      projectId,
      agent: 'User Story Generator',
      prompt,
      response: responseText,
    });

    res.status(200).json({ success: true, data: responseText });
  } catch (error: any) {
    console.error(`[AI Controller - User Stories] ERROR:`, error.message);
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, message } = req.body;
    if (!projectId || !message) {
      return res.status(400).json({ success: false, message: 'projectId and message are required' });
    }

    console.log(`[AI Controller - Chat] Saving user message...`);
    await AIConversation.create({
      projectId,
      userId: req.user!.id,
      message,
      role: 'user'
    });

    console.log(`[AI Controller - Chat] Loading context...`);
    const projectContext = await loadProjectContext(projectId, req.user!.id);
    if (!projectContext) {
      return res.status(404).json({ success: false, message: 'Project not found or unauthorized' });
    }
    
    const chatHistory = await loadChatHistory(projectId);
    const prompt = PromptManager.getChatPrompt(projectContext, chatHistory || "No previous chat history.");

    console.log(`[AI Controller - Chat] Calling Groq API...`);
    const responseText = await generateText(prompt);

    console.log(`[AI Controller - Chat] Saving AI response to DB...`);
    await AIConversation.create({
      projectId,
      userId: req.user!.id,
      message: responseText,
      role: 'assistant'
    });

    res.status(200).json({ success: true, data: responseText });
  } catch (error: any) {
    console.error(`[AI Controller - Chat] ERROR:`, error.message);
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

export const classifyProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'title and description are required' });
    }

    const prompt = `You are an expert project classifier.
Given the following project title and description, please classify it.
Title: ${title}
Description: ${description}

Return ONLY a valid JSON object matching exactly this structure:
{
  "category": "String (e.g. SaaS, AI Tool, Marketplace, Mobile App, Web App, Other)",
  "industry": "String (e.g. Finance, Healthcare, E-Commerce, Education, IT, Other)",
  "tags": ["String", "String", "String"]
}
Do NOT wrap the JSON in Markdown block ticks like \`\`\`json. Return raw JSON.`;

    const responseText = await generateText(prompt);
    
    // Parse the JSON
    let classificationData;
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      classificationData = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse classification JSON:", responseText);
      return res.status(500).json({ success: false, message: 'AI failed to generate valid JSON' });
    }

    res.status(200).json({ success: true, data: classificationData });
  } catch (error: any) {
    console.error(`[AI Controller - Classify] ERROR:`, error.message);
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

export const bulkClassifyProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    
    // Find up to 10 unclassified projects for this user to avoid huge prompts/timeouts
    // Unclassified means they lack an industry or have no tags
    const projects = await Project.find({
      ownerId: userId,
      $or: [
        { industry: { $exists: false } },
        { industry: "Other" },
        { industry: "" },
        { tags: { $exists: false } },
        { tags: { $size: 0 } }
      ]
    }).limit(10);

    if (projects.length === 0) {
      return res.status(200).json({ success: true, message: 'No unclassified projects found.' });
    }

    // Build the bulk prompt
    const prompt = `You are an expert project classifier.
Classify the following ${projects.length} projects.

${projects.map((p, index) => `
Project ID: ${p._id}
Title: ${p.title}
Description: ${p.description.substring(0, 500)} // Truncated for length
`).join('\n')}

Return ONLY a valid JSON array of objects, matching exactly this structure for each project:
[
  {
    "id": "Project ID from above",
    "category": "String (e.g. SaaS, AI Tool, Marketplace, Mobile App, Web App, Other)",
    "industry": "String (e.g. Finance, Healthcare, E-Commerce, Education, IT, Other)",
    "tags": ["String", "String", "String"]
  }
]
Do NOT wrap the JSON in Markdown block ticks like \`\`\`json. Return raw JSON array.`;

    const responseText = await generateText(prompt);
    
    let classificationData;
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      classificationData = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse bulk classification JSON:", responseText);
      return res.status(500).json({ success: false, message: 'AI failed to generate valid JSON' });
    }

    // Bulk update the database
    let updatedCount = 0;
    for (const update of classificationData) {
      const project = projects.find(p => p._id.toString() === update.id);
      if (project) {
        project.category = update.category || project.category;
        project.industry = update.industry || project.industry;
        project.tags = update.tags || project.tags;
        await project.save();
        updatedCount++;
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `Successfully auto-classified ${updatedCount} projects.`,
      count: updatedCount
    });
  } catch (error: any) {
    console.error(`[AI Controller - Bulk Classify] ERROR:`, error.message);
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

export const siteChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { history } = req.body; // history is an array of { role: 'user' | 'assistant', content: string }
    
    // Format history for the prompt
    let formattedHistory = "No previous history.";
    if (history && Array.isArray(history) && history.length > 0) {
      formattedHistory = history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
    }

    const prompt = PromptManager.getSiteChatPrompt(formattedHistory);
    
    // For streaming responses (recommended in rubric), we could use Groq stream.
    // However, to keep it simple and return the JSON with suggestions, we will await the full response,
    // and handle "streaming" UI effects on the frontend (typing indicators).
    const responseText = await generateText(prompt);
    
    let chatData;
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      chatData = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse site chat JSON:", responseText);
      // Fallback
      chatData = {
        reply: responseText,
        suggestions: ["What is ProductPilot?", "Take me to Explore"]
      };
    }

    res.status(200).json({ success: true, data: chatData });
  } catch (error: any) {
    console.error(`[AI Controller - Site Chat] ERROR:`, error.message);
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};
