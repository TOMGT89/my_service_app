const mongoose = require('mongoose');
const User = require('./models/User');

const ACTUAL_URI = 'mongodb+srv://tomgthome:Tomkorre1989!@cluster0.gubyec0.mongodb.net/service-app-db?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(ACTUAL_URI)
    .then(async () => {
        console.log('Connected to ACTUAL DB (service-app-db)');
        const users = await User.find({}, 'username role createdAt').sort({ createdAt: -1 });
        console.log('ALL USERS:');
        users.forEach(u => {
            console.log(`- '${u.username}' [${u.role}] (Created: ${u.createdAt})`);
        });
        process.exit();
    })
    .catch(err => console.error(err));
