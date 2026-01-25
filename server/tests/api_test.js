const http = require('http');

const BASE_URL = 'http://localhost:4000/api';

function test(name, fn) {
    console.log(`Running test: ${name}...`);
    fn().then(() => console.log(`✅ ${name} passed`))
        .catch(err => console.error(`❌ ${name} failed:`, err.message));
}

async function fetchJSON(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
        const req = http.request(`${BASE_URL}${endpoint}`, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, body: json });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', reject);

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        req.end();
    });
}

async function runTests() {
    console.log("⚠️ Make sure the server is running on port 4000 before running this script!\n");

    // Test 1: AI Chat (Local Knowledge Base)
    test('AI Chat - Local Knowledge', async () => {
        const res = await fetchJSON('/ai/chat', {
            method: 'POST',
            body: { message: 'How do I post a job?' }
        });
        
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
        if (!res.body.response.includes('Post Jobs')) throw new Error('Response did not contain expected keyword');
        if (res.body.source !== 'local') throw new Error('Did not use local knowledge base');
    });

    // Test 2: AI Chat (Fallback/Unknown)
    test('AI Chat - Fallback', async () => {
        const res = await fetchJSON('/ai/chat', {
            method: 'POST',
            body: { message: 'What is the meaning of life?' }
        });
        
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
        // Depending on implementation, it might fallback to Gemini or default message
        // Just checking it returns 200 is good enough for connectivity
    });

    // Test 3: Public Jobs Endpoint
    test('Get Jobs', async () => {
        const res = await fetchJSON('/jobs');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
        if (!Array.isArray(res.body)) throw new Error('Response is not an array');
    });

    // Test 4: Auth Fail (No Token)
    test('Post Job without Auth', async () => {
        const res = await fetchJSON('/jobs', {
            method: 'POST',
            body: { title: 'Test', company: 'Test', description: 'Test' }
        });
        if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    });
}

runTests();