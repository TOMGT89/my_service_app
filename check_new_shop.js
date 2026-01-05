require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        // Find the most recently created 'admin' user
        const user = await User.findOne({ role: 'admin' }).sort({ createdAt: -1 });

        if (!user) {
            console.log('❌ No Admin User Found.');
        } else {
            console.log('✅ Latest Admin User Found:');
            console.log(`ID: ${user._id}`);
            console.log(`Username: '${user.username}' (Length: ${user.username.length})`);
            console.log(`Shop ID: ${user.shop}`);
            console.log(`Role: ${user.role}`);

            // Check for surrounding spaces
            if (user.username !== user.username.trim()) {
                console.log('⚠️ WARNING: Username has leading/trailing spaces!');
            }
        }
        process.exit();
    })
    .catch(err => console.error(err));
