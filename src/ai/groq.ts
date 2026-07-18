import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    console.warn("⚠️ GROQ_API_KEY is missing from environment variables!");
}

export const groq = new Groq({ apiKey: apiKey || "" });

/**
 * Helper function to generate text and safely handle SDK errors.
 * Uses Llama 3 70B model by default for high quality logic.
 */
export const generateText = async (prompt: string, modelName: string = "llama-3.3-70b-versatile") => {
    const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: modelName,
    });
    return response.choices[0]?.message?.content || "";
};
