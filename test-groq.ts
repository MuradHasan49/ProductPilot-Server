import 'dotenv/config';
import Groq from 'groq-sdk';

async function testGroqAPI() {
    console.log('🧪 Starting Standalone Groq API Connection Test...');
    console.log('----------------------------------------------------');

    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
        console.error('❌ ERROR: GROQ_API_KEY is not set in your .env file!');
        process.exit(1);
    }
    
    console.log(`🔑 API Key Found: ${apiKey.substring(0, 10)}... (truncated for security)`);
    
    try {
        console.log('⏳ Initializing groq-sdk...');
        const groq = new Groq({ apiKey });

        const testPrompt = 'Respond with exactly one word: SUCCESS';
        console.log(`🤖 Sending test prompt to llama-3.3-70b-versatile: "${testPrompt}"...`);

        const response = await groq.chat.completions.create({
            messages: [{ role: 'user', content: testPrompt }],
            model: 'llama-3.3-70b-versatile',
        });

        console.log('✅ TEST PASSED!');
        console.log('📝 Raw Response Text:', response.choices[0]?.message?.content);
        console.log('----------------------------------------------------');

    } catch (error: any) {
        console.error('\n❌ API TEST FAILED!');
        console.error('----------------------------------------------------');
        console.error('🔥 Raw Error Object:', error.message);
        console.error('----------------------------------------------------');
        process.exit(1);
    }
}

testGroqAPI();
