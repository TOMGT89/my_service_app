
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function checkUsers() {
    try {
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        const User = mongoose.model('User', new mongoose.Schema({
            username: String,
            role: String,
            shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }
        }));

        const users = await User.find({});
        console.log('--- USERS ---');
        users.forEach(u => console.log(`- ${u.username} (${u.role})`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
