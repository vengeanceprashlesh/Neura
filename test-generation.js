// Quick test script to check generation
async function testGeneration() {
    console.log('Testing Neura generation...\n');

    try {
        console.log('1. Testing app-spec endpoint...');
        const specRes = await fetch('http://localhost:3000/api/app-spec', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'Create a simple counter' })
        });

        console.log('Status:', specRes.status);
        const specData = await specRes.text();
        console.log('Response:', specData.substring(0, 500));

        if (!specRes.ok) {
            console.error('ERROR:', specData);
            return;
        }

        console.log('\n✅ App spec generation works!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testGeneration();
