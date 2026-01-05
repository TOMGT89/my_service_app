const mongoose = require('mongoose');

// Constructed from user input
const MONGO_URI = 'mongodb+srv://tomgthome:Tomkorre1989!@cluster0.gubyec0.mongodb.net/service-app-db?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB Atlas...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ SUCCESS: Connected to MongoDB Atlas!');

        // Optional: Create a test document to ensure write access
        // const Test = mongoose.model('Test', new mongoose.Schema({ name: String }));
        // await Test.create({ name: 'Connection Check' });
        // console.log('✅ SUCCESS: Write permission verified.');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR: Could not connect to MongoDB Atlas.');
        console.error(error);
        process.exit(1);
    }
}

testConnection();
