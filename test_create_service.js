require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:5000'; // Or the Cloud URL if we want to test Cloud
// For debugging logic we use Localhost if running.
// If verifying User's Cloud issue, we should use Cloud URL.
const CLOUD_URL = 'https://my-service-app-5sit.onrender.com';

const TARGET_URL = CLOUD_URL;

async function testPersistence() {
    try {
        console.log(`1. Logging in to ${TARGET_URL}...`);
        const loginRes = await axios.post(`${TARGET_URL}/api/login`, {
            username: 'superadmin',
            password: 'password123'
        });

        if (!loginRes.data.success) {
            console.error('❌ Login Failed:', loginRes.data);
            return;
        }

        const token = loginRes.data.token;
        console.log('✅ Login Success. Token:', token.substring(0, 10));

        console.log('2. Creating Service...');
        const serviceData = {
            vehiclePlate: 'TEST-9999',
            description: 'Test Service from Debug Script',
            status: 'Pending'
        };

        const createRes = await axios.post(`${TARGET_URL}/api/services`, serviceData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Create Response Status:', createRes.status);
        console.log('✅ Create Response Data:', createRes.data);

        console.log('3. Verifying Persistence (GET Pending)...');
        const getRes = await axios.get(`${TARGET_URL}/api/services/pending`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const found = getRes.data.find(s => s.vehiclePlate === 'TEST-9999');
        if (found) {
            console.log('✅ SUCCESS! Service saved and retrieved.');
            // Cleanup
            console.log('4. Cleaning up...');
            // No delete route for services? We might leave it or delete if user has delete permission.
        } else {
            console.error('❌ FAILURE! Service created but NOT found in list.');
            console.log('List:', JSON.stringify(getRes.data, null, 2));
        }

    } catch (e) {
        console.error('❌ ERROR:', e.message);
        if (e.response) console.error('Response:', e.response.data);
    }
}

testPersistence();
