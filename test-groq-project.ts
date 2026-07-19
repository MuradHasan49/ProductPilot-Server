import dotenv from 'dotenv';
dotenv.config();

import { generateText } from './src/ai/groq';
import { PromptManager } from './src/ai/promptManager';

async function test() {
  const idea = "i want build to fitnes tracer app";
  const prompt = PromptManager.getProjectGenerationPrompt(idea);
  console.log("Calling Groq...");
  try {
    const responseText = await generateText(prompt);
    console.log("--- RAW RESPONSE ---");
    console.log(responseText);
    console.log("--------------------");

    const match = responseText.match(/\{[\s\S]*\}/);
    if (match) {
      console.log("Matched JSON:");
      console.log(match[0]);
      const data = JSON.parse(match[0]);
      console.log("Parsed Data:", data);
    } else {
      console.log("No JSON block found.");
    }
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
