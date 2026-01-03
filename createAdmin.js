require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Η βάση συνδέθηκε...");

    // Έλεγχος αν υπάρχει ήδη admin
    const adminExists = await User.findOne({ username: 'admin' });
    
    if (adminExists) {
      console.log("⚠️ Ο χρήστης admin υπάρχει ήδη!");
    } else {
      // Δημιουργία του Admin
      await User.create({
        username: 'admin',
        password: 'admin', // Προσωρινός κωδικός όπως ζήτησες
        role: 'admin',
        shopName: 'My Super Garage'
      });
      console.log("🎉 Ο Admin δημιουργήθηκε! (Username: admin / Pass: admin)");
    }
    process.exit();
  } catch (error) {
    console.error("❌ Σφάλμα:", error);
    process.exit(1);
  }
};

createAdmin();