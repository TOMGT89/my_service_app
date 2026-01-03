const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://tomgthome:Tomkorre1989!@cluster0.gubyec0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

console.log('Testing connection to:', MONGO_URI);

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connection Successful!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection Failed:', err);
        process.exit(1);
    });
