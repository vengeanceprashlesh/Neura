// Simple test script to check if the API is working
async function testAPI() {
    const baseURL = 'http://localhost:3000';

    console.log('Testing Neura API endpoints...\n');

    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    try {
        const healthRes = await fetch(`${baseURL}/api/health`);
        console.log(`   Status: ${healthRes.status}`);
        const healthData = await healthRes.json();
        console.log(`   Response:`, healthData);
    } catch (error) {
        console.log(`   Error:`, error.message);
    }

    // Test 2: Chat endpoint
    console.log('\n2. Testing chat endpoint...');
    try {
        const chatRes = await fetch(`${baseURL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'user', parts: [{ type: 'text', text: 'Hello' }] }
                ]
            })
        });
        console.log(`   Status: ${chatRes.status}`);
        console.log(`   Headers:`, Object.fromEntries(chatRes.headers.entries()));
        const chatText = await chatRes.text();
        console.log(`   Response (first 200 chars):`, chatText.substring(0, 200));
    } catch (error) {
        console.log(`   Error:`, error.message);
    }

    // Test 3: Homepage
    console.log('\n3. Testing homepage...');
    try {
        const homeRes = await fetch(baseURL);
        console.log(`   Status: ${homeRes.status}`);
        console.log(`   Content-Type:`, homeRes.headers.get('content-type'));
    } catch (error) {
        console.log(`   Error:`, error.message);
    }

    console.log('\nTests complete!');
}

testAPI().catch(console.error);
