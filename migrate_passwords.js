require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// HARDCODED CLOUD URI TO ENSURE CONSISTENCY
const MONGO_URI = 'mongodb+srv://tomgthome:Tomkorre1989!@cluster0.gubyec0.mongodb.net/service-app-db?retryWrites=true&w=majority&appName=Cluster0';

const migratePasswords = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB CLOUD');

        const users = await User.find({});
        console.log(`Found ${users.length} users to check.`);

        let updatedCount = 0;

        for (const user of users) {
            // Check if password starts with $2a$ or similar (bcrypt hash)
            // If length is < 50, it's definitely not a bcrypt hash (usually 60 chars)
            if (!user.password.startsWith('$2') || user.password.length < 50) {
                console.log(`Migrating user: ${user.username}`);

                // Force update to trigger pre-save hook
                const plainText = user.password;
                user.password = plainText;
                user.markModified('password');

                await user.save();
                updatedCount++;
                console.log(`User ${user.username} migrated.`);
            } else {
                console.log(`User ${user.username} already hashed. Skipping.`);
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} users.`);
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migratePasswords();
