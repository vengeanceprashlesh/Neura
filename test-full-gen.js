// Test full generation flow
async function testFullGeneration() {
    console.log('Testing FULL generation flow...\n');

    try {
        console.log('Calling /api/generate-app...');
        const res = await fetch('http://localhost:3000/api/generate-app', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'Create a counter with increment button' })
        });

        console.log('Status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('❌ ERROR Response:', errorText);
            return;
        }

        const data = await res.json();
        console.log('\n✅ SUCCESS!');
        console.log('Project ID:', data.projectId);
        console.log('Files:', Object.keys(data.files));

    } catch (error) {
        console.error('❌ Exception:', error.message);
    }
}

testFullGeneration();
