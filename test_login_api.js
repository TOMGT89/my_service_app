const https = require('http'); // using http module for localhost

const postData = JSON.stringify({
    username: 'admin',
    password: 'admin123'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Body:', data);
        try {
            const json = JSON.parse(data);
            if (json.success && json.token) {
                console.log('✅ LOGIN VERIFIED: Token received');
            } else {
                console.log('❌ LOGIN FAILED: No token');
            }
        } catch (e) { console.log('❌ Parse Error'); }
    });
});

req.on('error', (e) => {
    console.error('❌ Request Error:', e.message);
});

req.write(postData);
req.end();
