const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    // Login Credentials for the Shop Owner (Super User of the Shop)
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Business Details (Settings)
    name: { type: String, required: true },
    address: { type: String },
    vatNumber: { type: String }, // ΑΦΜ
    phones: { type: [String], default: [] },
    website: { type: String },

    // Branding (White Label)
    logoUrl: { type: String },
    stampUrl: { type: String },
    theme: { type: String, default: 'default' }, // 'midnight', 'forest', etc.
    color: { type: String, default: '#3b82f6' }, // Primary Hex Color

    // Subscription (SaaS)
    plan: {
        type: String,
        enum: ['Basic', 'Pro', 'Enterprise'],
        default: 'Basic'
    },
    status: {
        type: String,
        enum: ['Active', 'Expired', 'Trial'],
        default: 'Trial'
    },
    subscriptionExpiry: { type: Date },

    // System Flags
    isSuperAdmin: { type: Boolean, default: false } // True ONLY for YOU (The SaaS Owner)
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
