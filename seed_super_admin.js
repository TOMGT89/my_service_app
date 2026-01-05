const mongoose = require('mongoose');
const Shop = require('./models/Shop');
const User = require('./models/User');
require('dotenv').config();

const seedSuperAdmin = async () => {
    try {
        // await mongoose.connect(process.env.MONGO_URI);
        await mongoose.connect('mongodb+srv://tomgthome:Tomkorre1989!@cluster0.gubyec0.mongodb.net/service-app-db?retryWrites=true&w=majority&appName=Cluster0');
        console.log('🔌 Connected to DB');

        // 1. Check if Super Admin Shop exists
        const existing = await Shop.findOne({ isSuperAdmin: true });
        if (existing) {
            console.log('⚠️ Super Admin Shop already exists.');
            process.exit(0);
        }

        // 2. Create Super Shop
        const superShop = new Shop({
            email: 'admin@geoter.gr',
            password: 'admin', // Not used for login directly, but good to have
            name: 'GEOTER HQ',
            isSuperAdmin: true,
            plan: 'Enterprise',
            status: 'Active'
        });
        await superShop.save();
        console.log('✅ Super Shop Created:', superShop.name);

        // 3. Create Super User
        const superUser = new User({
            username: 'superadmin',
            password: 'password123', // Change this!
            role: 'superadmin',
            shop: superShop._id,
            shopName: 'HQ Dashboard'
        });
        await superUser.save();
        console.log('✅ Super User Created: superadmin / password123');

        mongoose.disconnect();
    } catch (e) {
        console.error(e);
        mongoose.disconnect();
    }
};

seedSuperAdmin();
