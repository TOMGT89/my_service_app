const https = require('https');

const data = JSON.stringify({
    username: 'superadmin',
    password: 'password123'
});

const options = {
    hostname: 'my-service-app-5sit.onrender.com',
    port: 443,
    path: '/api/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('--- SENDING REQUEST ---');
const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    let body = '';
    res.on('data', (d) => {
        body += d;
    });

    res.on('end', () => {
        console.log('--- RESPONSE BODY ---');
        console.log(body);
        console.log('---------------------');
    });
});

req.on('error', (error) => {
    console.error('ERROR:', error);
});

req.write(data);
req.end();
