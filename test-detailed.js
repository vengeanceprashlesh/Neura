// Test with longer timeout
async function testWithDetails() {
    console.log('Testing generation with full details...\n');

    const startTime = Date.now();

    try {
        console.log('Starting request...');
        const res = await fetch('http://localhost:3000/api/generate-app', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'simple counter' })
        });

        const elapsed = Date.now() - startTime;
        console.log(`\nResponse received after ${elapsed}ms`);
        console.log('Status:', res.status);

        const text = await res.text();
        console.log('Response length:', text.length);

        if (!res.ok) {
            console.error('\n❌ ERROR:', text);
            return;
        }

        const data = JSON.parse(text);
        console.log('\n✅ SUCCESS!');
        console.log('Files:', Object.keys(data.files));
        console.log('\nFirst file preview:');
        console.log(Object.values(data.files)[0].substring(0, 200));

    } catch (error) {
        const elapsed = Date.now() - startTime;
        console.error(`\n❌ Failed after ${elapsed}ms:`, error.message);
    }
}

testWithDetails();
