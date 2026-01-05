require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// HARDCODED CLOUD URI TO ENSURE CONSISTENCY
const MONGO_URI = 'mongodb+srv://tomgthome:Tomkorre1989!@cluster0.gubyec0.mongodb.net/service-app-db?retryWrites=true&w=majority&appName=Cluster0';

const resetAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB CLOUD');

        const admin = await User.findOne({ username: 'admin' });
        if (!admin) {
            console.log('Admin not found in Cloud DB! Creating...');
            await User.create({
                username: 'admin',
                password: 'admin123', // Will be hashed by hook
                role: 'superadmin',
                shopName: 'Geoter',
                theme: 'midnight'
            });
        } else {
            console.log('Admin found, resetting password...');
            // Need to set it and mark modified
            admin.password = 'admin123';
            admin.markModified('password');
            await admin.save();
        }
        console.log('✅ Admin password set to: admin123');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
resetAdmin();
