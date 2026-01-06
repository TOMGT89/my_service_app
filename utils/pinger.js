const axios = require('axios');

const RENDER_URL = 'https://my-service-app-5sit.onrender.com/api/ping';
const INTERVAL = 12 * 60 * 1000; // 12 minutes

console.log(`🚀 Anti-Sleep Pinger started. Target: ${RENDER_URL}`);

const keepAlive = async () => {
    try {
        const response = await axios.get(RENDER_URL);
        console.log(`[${new Date().toLocaleTimeString()}] Ping successful:`, response.data.status);
    } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] Ping failed:`, error.message);
    }
};

// Initial ping
keepAlive();

// Schedule pings
setInterval(keepAlive, INTERVAL);
