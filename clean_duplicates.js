const mongoose = require('mongoose');

// Constructed from user input
const MONGO_URI = 'mongodb+srv://tomgthome:Tomkorre1989!@cluster0.gubyec0.mongodb.net/service-app-db?retryWrites=true&w=majority&appName=Cluster0';

const VehicleSchema = new mongoose.Schema({
    plateNumber: String,
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }
}, { strict: false });
const Vehicle = mongoose.model('Vehicle', VehicleSchema);

async function cleanDuplicates() {
    try {
        console.log('Connecting to Cloud DB...');
        await mongoose.connect(MONGO_URI);

        // 1. Delete Phantom/Empty Plates
        const deleteEmpty = await Vehicle.deleteMany({
            $or: [{ plateNumber: null }, { plateNumber: "" }, { plateNumber: " " }]
        });
        console.log(`🗑️  Deleted ${deleteEmpty.deletedCount} ghost vehicles (empty plates).`);

        // 2. Find Duplicates
        const vehicles = await Vehicle.find({});
        const seen = new Map();
        let duplicates = 0;

        for (const v of vehicles) {
            // Normalize plate
            const plate = (v.plateNumber || '').trim().toUpperCase();
            if (!plate) continue; // Already handled

            if (seen.has(plate)) {
                // Duplicate found! Delete this one (assuming earlier one is "original", or we could check dates)
                await Vehicle.findByIdAndDelete(v._id);
                duplicates++;
            } else {
                seen.set(plate, true);
            }
        }

        console.log(`🗑️  Deleted ${duplicates} duplicate vehicles.`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR:', error);
        process.exit(1);
    }
}

cleanDuplicates();
