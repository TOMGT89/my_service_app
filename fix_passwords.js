require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ACTUAL_URI = 'mongodb+srv://tomgthome:Tomkorre1989!@cluster0.gubyec0.mongodb.net/service-app-db?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(ACTUAL_URI)
    .then(async () => {
        console.log('Connected to DB');

        const usersToFix = [
            { username: 'test', password: 'test' },
            { username: 'arab', password: '123' }
        ];

        for (const target of usersToFix) {
            const user = await User.findOne({ username: target.username });
            if (user) {
                console.log(`Fixing user: ${user.username}`);
                user.password = target.password; // Model hook will hash once
                await user.save();
                console.log(`✅ User ${user.username} fixed.`);
            }
        }
        process.exit();
    })
    .catch(err => console.error(err));
