require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        const users = await User.find({}, 'username email role createdAt').sort({ createdAt: -1 });
        console.log('ALL USERS:');
        users.forEach(u => {
            console.log(`- '${u.username}' [${u.role}] (Created: ${u.createdAt})`);
        });
        process.exit();
    })
    .catch(err => console.error(err));
