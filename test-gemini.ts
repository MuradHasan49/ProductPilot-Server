import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function testGeminiAPI() {
    console.log('🧪 Starting Standalone Gemini API Connection Test...');
    console.log('----------------------------------------------------');

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error('❌ ERROR: GEMINI_API_KEY is not set in your .env file!');
        process.exit(1);
    }
    
    console.log(`🔑 API Key Found: ${apiKey.substring(0, 10)}... (truncated for security)`);
    
    try {
        console.log('⏳ Initializing @google/genai SDK...');
        const ai = new GoogleGenAI({ apiKey });

        const testPrompt = 'Respond with exactly one word: SUCCESS';
        console.log(`🤖 Sending test prompt to gemini-2.0-flash: "${testPrompt}"...`);

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: testPrompt,
        });

        console.log('✅ TEST PASSED!');
        console.log('📝 Raw Response Text:', response.text);
        console.log('----------------------------------------------------');

    } catch (error: any) {
        console.error('\n❌ API TEST FAILED!');
        console.error('----------------------------------------------------');
        
        // Print the COMPLETE Google error object as requested
        if (error.response) {
            console.error('🌐 HTTP Status Code:', error.response.status);
            console.error('📦 Full Response Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('🔥 Raw Error Object:', error);
            console.error('💥 Stack Trace:', error.stack);
        }
        console.error('----------------------------------------------------');
        
        // Specific checks for 429
        if (error.message?.includes('429') || error.message?.includes('quota')) {
            console.error('💡 ROOT CAUSE DIAGNOSIS: You are receiving a 429 Too Many Requests error.');
            console.error('This means your Google Cloud Account / AI Studio has a Free Tier limit of 0, or you have exceeded your billing quota.');
            console.error('You MUST attach a billing account to your Google Cloud Project to lift this restriction.');
        }

        process.exit(1);
    }
}

testGeminiAPI();
