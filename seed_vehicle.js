const axios = require('axios');

async function seed() {
    try {
        const payload = {
            plateNumber: "ABC-1234",
            brand: "TOYOTA",
            model: "YARIS",
            ownerName: "Test Customer",
            ownerPhone: "6900000000"
        };
        console.log('Adding vehicle...');
        const res = await axios.post('http://localhost:5000/api/vehicles', payload);
        console.log('Vehicle Added:', res.data);
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) console.error(e.response.data);
    }
}

seed();
