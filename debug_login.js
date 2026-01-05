const mongoose = require('mongoose');
const User = require('./models/User');
const Shop = require('./models/Shop'); // Register Shop model

const run = async () => {
    try {
        console.log('Connecting to Cloud DB...');
        await mongoose.connect('mongodb+srv://tomgthome:Tomkorre1989!@cluster0.gubyec0.mongodb.net/service-app-db?retryWrites=true&w=majority&appName=Cluster0');
        console.log('Connected!');

        const username = 'superadmin';
        const password = 'password123';

        console.log(`Attempting login for: ${username}`);

        // REPLICATING SERVER LOGIC EXACTLY
        const user = await User.findOne({ username }).populate('shop');
        console.log('User Found:', user ? user.username : 'NO USER');

        if (!user) {
            console.log('Result: User Not Found');
            process.exit(0);
        }

        console.log(`Password Check: Input '${password}' vs DB '${user.password}' isMatch? ${user.password === password}`);

        if (user.password !== password) {
            console.log('Result: Wrong Password');
            process.exit(0);
        }

        if (user.shop && user.shop.status === 'Expired') {
            console.log('Result: Subscription Expired');
            process.exit(0);
        }

        console.log('Result: Login Success!', user);

    } catch (e) {
        console.error('CRITICAL ERROR:', e);
    } finally {
        mongoose.disconnect();
    }
};

run();
