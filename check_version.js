const https = require('https');

const options = {
    hostname: 'my-service-app-5sit.onrender.com',
    port: 443,
    path: '/api/version',
    method: 'GET'
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => {
        console.log('BODY:', body);
    });
});

req.on('error', (e) => {
    console.error('ERROR:', e.message);
});

req.end();
