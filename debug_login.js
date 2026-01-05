const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Shop = require('./models/Shop');

const run = async () => {
    try {
        await mongoose.connect('mongodb+srv://tomgthome:Tomkorre1989!@cluster0.gubyec0.mongodb.net/service-app-db?retryWrites=true&w=majority&appName=Cluster0');
        console.log('Connected');

        const testUsername = 'debug_emp_' + Date.now();
        const testPass = 'pass123';

        console.log(`Creating user ${testUsername} with password ${testPass}...`);

        // Mock Shop
        const shop = await Shop.findOne();
        if (!shop) throw new Error('No shop found');

        const user = await User.create({
            username: testUsername,
            password: testPass,
            role: 'employee',
            shop: shop._id
        });

        console.log('User created:', user._id);
        console.log('Stored Hash:', user.password);
        console.log('Stored Plain:', user.plainPassword);

        // Verify direct compare
        const isMatchBefore = await bcrypt.compare(testPass, user.password);
        console.log('Direct bcrypt compare (in-memory object):', isMatchBefore);

        // Fetch from DB
        const fetchedUser = await User.findOne({ username: testUsername });
        console.log('Fetched Hash:', fetchedUser.password);

        const isMatchAfter = await fetchedUser.comparePassword(testPass);
        console.log('Method comparePassword result:', isMatchAfter);

        if (isMatchAfter) console.log('✅ LOGIN SHOULD WORK');
        else console.log('❌ LOGIN FAILED');

        // Cleanup
        await User.findByIdAndDelete(user._id);

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
};

run();
