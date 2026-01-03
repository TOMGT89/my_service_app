const axios = require('axios');

async function seed() {
    try {
        const vehicle = (await axios.get('http://localhost:5000/api/vehicles')).data.find(v => v.plateNumber === 'ABC-1234');
        if (!vehicle) return console.error('Vehicle not found');

        // Create a service record from 6 months ago
        const date = new Date();
        date.setMonth(date.getMonth() - 6);

        const payload = {
            vehiclePlate: "ABC-1234",
            mechanic: "admin",
            servicesPerformed: [
                {
                    categoryTitle: "ΛΑΔΙΑ - ΝΕΡΑ - ΒΑΛΒΟΛΙΝΗ",
                    items: [
                        { name: "ΛΑΔΙ ΜΗΧΑΝΗΣ", action: "ΑΛΛΑΓΗ" },
                        { name: "ΦΙΛΤΡΟ ΛΑΔΙΟΥ", action: "ΑΛΛΑΓΗ" }
                    ]
                }
            ],
            generalNotes: "ΧΛΜ: 100000 | VIN: 12345Test",
            status: "Completed",
            completedAt: date.toISOString()
        };

        console.log('Adding Service Record...');
        const res = await axios.post('http://localhost:5000/api/services', payload);
        console.log('Record Added:', res.data._id);
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) console.error(e.response.data);
    }
}

seed();
