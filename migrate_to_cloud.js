const mongoose = require('mongoose');
require('dotenv').config();

// Models
const User = require('./models/User');
const Shop = require('./models/Shop');
const Vehicle = require('./models/Vehicle');
const ServiceRecord = require('./models/ServiceRecord');
const Expense = require('./models/Expense');
const RecurringExpense = require('./models/RecurringExpense');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/service-app';
const CLOUD_URI = 'mongodb+srv://tomgthome:Tomkorre1989!@cluster0.gubyec0.mongodb.net/service-app-db?retryWrites=true&w=majority&appName=Cluster0';

async function migrateData() {
    try {
        console.log('📦 Starting Migration...');

        // 1. Fetch Data from Local
        console.log('   Connecting to Local DB...');
        await mongoose.connect(LOCAL_URI);

        console.log('   Reading Local Data...');
        const users = await User.find().lean();
        const shops = await Shop.find().lean();
        const vehicles = await Vehicle.find().lean();
        const services = await ServiceRecord.find().lean();
        const expenses = await Expense.find().lean();
        const recurring = await RecurringExpense.find().lean();

        console.log(`   Found: ${users.length} Users, ${shops.length} Shops, ${vehicles.length} Vehicles, ${services.length} Services.`);

        await mongoose.disconnect();
        console.log('   Disconnected from Local DB.');

        // 2. Upload Data to Cloud
        console.log('☁️  Connecting to Cloud DB...');
        await mongoose.connect(CLOUD_URI);

        console.log('   Clearing Cloud DB (Safety Check)...');
        // Be careful with this in production! For migration, we assume cloud is empty or overwriteable.
        await User.deleteMany({});
        await Shop.deleteMany({});
        await Vehicle.deleteMany({});
        await ServiceRecord.deleteMany({});
        await Expense.deleteMany({});
        await RecurringExpense.deleteMany({});

        console.log('   Uploading Data...');
        await Shop.insertMany(shops); // Insert Shops first as others depend on it
        await User.insertMany(users);
        await Vehicle.insertMany(vehicles);
        await ServiceRecord.insertMany(services);
        await Expense.insertMany(expenses);
        await RecurringExpense.insertMany(recurring);

        console.log('✅ MIGRATION SUCCESSFUL! All data moved to Cloud.');

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('❌ MIGRATION FAILED:', error);
        process.exit(1);
    }
}

migrateData();
