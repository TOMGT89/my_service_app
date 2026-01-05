
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    plainPassword: String
});

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.plainPassword = this.password;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

async function fixTestUser() {
    try {
        await mongoose.connect(MONGO_URI);
        const User = mongoose.model('User', UserSchema);

        const username = 'test';
        const newPassword = '123';

        let user = await User.findOne({ username });
        if (user) {
            console.log('Found user "test". Resetting password to "123"...');
            user.password = newPassword;
            await user.save();
            console.log('Password reset successfully!');
        } else {
            console.log('User "test" not found in service-app-db.');
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixTestUser();
