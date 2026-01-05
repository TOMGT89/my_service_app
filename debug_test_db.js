
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI_RAW = process.env.MONGO_URI;
// Try to connect to 'test' database instead of 'service-app-db'
const MONGO_URI_TEST = MONGO_URI_RAW.replace('/service-app-db', '/test');

async function checkUsers() {
    try {
        console.log('Connecting to (test db):', MONGO_URI_TEST.split('@')[1]); // Hide credentials
        await mongoose.connect(MONGO_URI_TEST);
        console.log('Connected!');

        const User = mongoose.model('User', new mongoose.Schema({
            username: String,
            role: String
        }));

        const users = await User.find({});
        console.log('--- USERS in TEST DB ---');
        users.forEach(u => console.log(`- ${u.username} (${u.role})`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
