export const PromptManager = {
  getPRDPrompt: (projectContext: string, length: string = 'medium') => {
    let lengthInstruction = "";
    if (length === 'short') lengthInstruction = "Keep the PRD very brief and high-level (under 400 words).";
    if (length === 'long') lengthInstruction = "Make the PRD extremely detailed and comprehensive (over 1000 words).";
    
    return `
You are an expert Product Manager. Based on the following project context, generate a development-ready Product Requirements Document (PRD) in Markdown format.
${lengthInstruction}

Project Context:
${projectContext}

The PRD should include:
1. Executive Summary
2. Target Audience & Personas
3. Core Features (MVP)
4. Out of Scope Features
5. Success Metrics (KPIs)
6. Non-Functional Requirements
`;
  },

  getUserStoryPrompt: (projectContext: string, featuresContext: string, length: string = 'medium') => {
    let lengthInstruction = "";
    if (length === 'short') lengthInstruction = "Generate only the top 3-5 most critical user stories with brief acceptance criteria.";
    if (length === 'long') lengthInstruction = "Generate an extensive backlog of 15+ user stories with highly detailed acceptance criteria for edge cases.";

    return `
You are an expert Agile Product Owner. Based on the following project context and features, generate detailed User Stories in Markdown format.
${lengthInstruction}

Project Context:
${projectContext}

Features Context:
${featuresContext}

For each feature, create user stories in the format: "As a [type of user], I want [some goal] so that [some reason]".
Also, provide Acceptance Criteria for each story.
`;
  },

  getChatPrompt: (projectContext: string, chatHistory: string) => `
You are ProductPilot AI, an expert AI product management co-founder. You help users plan and refine their product ideas. 

Current Project Context:
${projectContext}

Previous Chat History:
${chatHistory}

Answer the user's question or assist them in planning their project. Keep your responses concise, actionable, and formatted in Markdown where appropriate.
`,

  getSiteChatPrompt: (chatHistory: string) => `
You are the official ProductPilot AI Site Assistant. You help users navigate the site and answer questions about the platform.

About ProductPilot:
- It is a platform for building, managing, and exploring product ideas.
- Public route '/explore' lists all public projects.
- Public route '/login' and '/register' are for authentication.
- Protected route '/dashboard' is for managing projects and accessing AI tools.
- Protected route '/items/add' or '/dashboard/projects/add' is for creating new projects.

Previous Conversation History:
${chatHistory}

Respond to the user's latest message. Keep your reply friendly, concise, and helpful. Provide markdown links if referencing routes (e.g. [Explore Projects](/explore)).

Return ONLY a valid JSON object matching exactly this structure:
{
  "reply": "Your markdown formatted reply here.",
  "suggestions": ["A short follow up question 1", "A short follow up question 2"]
}
Do NOT wrap the JSON in Markdown block ticks like \`\`\`json. Return raw JSON.
`,

  getProjectGenerationPrompt: (userIdea: string) => `
You are an expert Startup Founder and Product Manager. The user has provided a raw idea for an application or product.
Your job is to bootstrap a well-structured project based on this idea.

User's Raw Idea:
"${userIdea}"

Generate a highly professional, compelling project profile.
Return ONLY a valid JSON object matching exactly this structure:
{
  "title": "A catchy, short brand name or project title",
  "tagline": "A powerful 1-sentence tagline",
  "description": "A detailed 2-3 paragraph description of what the project does, its target audience, and core value proposition",
  "category": "Pick one: AI Tool, Marketplace, SaaS, Mobile App, Web App, Other",
  "industry": "e.g., HealthTech, FinTech, EdTech, E-commerce, etc.",
  "budget": 5000 (A realistic numerical budget estimate in USD based on the idea complexity, e.g. 2000, 5000, 15000)
}
Do NOT wrap the JSON in Markdown block ticks like \`\`\`json. Return raw JSON ONLY.
`,
};
