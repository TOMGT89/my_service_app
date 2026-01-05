require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://tomgthome:Tomkorre1989!@cluster0.gubyec0.mongodb.net/service-app-db?retryWrites=true&w=majority&appName=Cluster0';

const runTest = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB CLOUD');

        const testUsername = 'cloud_sec_test';
        const testPassword = 'CloudPassword123!';

        // Cleanup
        await User.deleteOne({ username: testUsername });

        // 1. Create User
        console.log('Creating test user...');
        const user = new User({
            username: testUsername,
            password: testPassword,
            role: 'admin'
        });
        await user.save(); // Should be hashed by hook

        // 2. Fetch User
        const savedUser = await User.findOne({ username: testUsername });

        // 3. Verify Hash
        const isHashed = savedUser.password.startsWith('$2');
        console.log(`🔹 Password Hashed in DB? ${isHashed ? 'YES ✅' : 'NO ❌'} (${savedUser.password.substring(0, 10)}...)`);

        if (!isHashed) throw new Error('Password was NOT hashed!');

        // 4. Verify Correct Password
        const match = await savedUser.comparePassword(testPassword);
        console.log(`🔹 Login with Correct Password: ${match ? 'SUCCESS ✅' : 'FAIL ❌'}`);

        // 5. Verify Wrong Password
        const noMatch = await savedUser.comparePassword('wrongpassword');
        console.log(`🔹 Login with Wrong Password: ${!noMatch ? 'SUCCESS (Blocked) ✅' : 'FAIL (Allowed) ❌'}`);

        await User.deleteOne({ username: testUsername });
        console.log('✅ Cleanup done');

        process.exit(0);
    } catch (e) {
        console.error('❌ Test Failed:', e);
        process.exit(1);
    }
};

runTest();
