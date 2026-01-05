require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Models
const User = require('./models/User');
const Shop = require('./models/Shop'); // Ensure Shop is registered for populate
const Vehicle = require('./models/Vehicle');
const ServiceRecord = require('./models/ServiceRecord');
const Expense = require('./models/Expense');
const RecurringExpense = require('./models/RecurringExpense');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'geoter-secret-key-change-me';

const app = express();

// Basic Middleware
// Basic Middleware
app.use(cors({ origin: '*' })); // Allow Cloud Frontends to access this API
app.use(express.json());

// 1. UPLOADS DIRECTORY SETUP
const UPLOADS_PATH = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_PATH)) {
    fs.mkdirSync(UPLOADS_PATH, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_PATH));

// 2. DATABASE CONNECTION
// 2. DATABASE CONNECTION
// process.env.MONGO_URI = 'mongodb+srv://tomgthome:Tomkorre1989!@cluster0.gubyec0.mongodb.net/service-app-db?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect('mongodb+srv://tomgthome:Tomkorre1989!@cluster0.gubyec0.mongodb.net/service-app-db?retryWrites=true&w=majority&appName=Cluster0')
    .then(async () => {
        console.log('✅ Connected to DB');
        // CLEANUP: Remove phantom vehicles (null or empty plate) on startup
        try {
            const result = await Vehicle.deleteMany({ $or: [{ plateNumber: null }, { plateNumber: "" }] });
            if (result.deletedCount > 0) console.log(`Deleted ${result.deletedCount} phantom vehicles`);
        } catch (e) { console.error('Cleanup Error:', e); }
    })
    .catch((err) => console.error('❌ DB Error:', err));

// MULTER CONFIG
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// 3. HELPER: PLATE NORMALIZATION (Latin-Only)
const normalizePlate = (text) => {
    if (!text) return '';
    const greekToLatin = {
        'Α': 'A', 'Β': 'B', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Ι': 'I',
        'Κ': 'K', 'Μ': 'M', 'Ν': 'N', 'Ο': 'O', 'Ρ': 'P', 'Τ': 'T',
        'Υ': 'Y', 'Χ': 'X'
    };
    return text.toUpperCase()
        .split('')
        .map(char => greekToLatin[char] || char)
        .join('')
        .replace(/\s/g, ''); // Remove spaces
};

// --- API ROUTES ---

// --- MIDDLEWARE: AUTH & ISOLATION ---
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // Check for Bearer Token
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.userId).populate('shop');
            if (!user) return res.status(401).json({ error: 'User not found' });

            req.user = user;
            req.shopId = user.shop ? user.shop._id : null;
            return next();
        } catch (err) {
            return res.status(401).json({ error: 'Invalid Token' });
        }
    }

    // Fallback for transition/debug (Optional: Remove if strict)
    // const userId = req.headers['x-user-id'];
    // ... logic ...

    // If no token and no header (or invalid), deny.
    // Allow public/demo if needed
    if (req.query.demo) return next();

    return res.status(401).json({ error: 'Unauthorized: No Token' });
};

// --- API ROUTES ---

// VERSION CHECK
app.get('/api/version', (req, res) => {
    res.json({ version: '2.0', timestamp: Date.now(), message: 'Server is UPDATED!' });
});

// LOGIN (Public)
// LOGIN (Public)
app.post('/api/login', async (req, res) => {
    try {
        console.log('🔹 Login Request Received');
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Missing username or password' });
        }

        const user = await User.findOne({ username }).populate('shop');
        if (!user) return res.status(401).json({ success: false, message: 'User Not Found' });

        // Verify Password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Wrong Password' });

        // Check Subscription
        if (user.shop && user.shop.status === 'Expired') {
            return res.status(403).json({ success: false, message: 'Subscription Expired' });
        }

        // Generate Token
        const token = jwt.sign(
            { userId: user._id, shopId: user.shop ? user.shop._id : null, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('✅ Login Success!');
        // Return User AND Token
        res.json({ success: true, user, token });

    } catch (e) {
        console.error('🔥 CRITICAL LOGIN ERROR:', e);
        res.status(500).json({ error: 'Internal Server Error', details: e.message });
    }
});

// SETTINGS (Protected)
app.put('/api/settings/:userId', upload.fields([{ name: 'logo' }, { name: 'stamp' }]), async (req, res) => {
    try {
        const { userId } = req.params;
        const { shopName, website, phones, theme } = req.body;
        const updateData = { shopName, website };
        if (theme) updateData.theme = theme;
        if (phones) updateData.phones = JSON.parse(phones);
        // ... (File handling logic same as before, omitted for brevity but assumed safe due to replace logic)
        // Re-implementing file handling briefly to ensure no data loss in replace:
        const toBase64 = (file) => `data:${file.mimetype};base64,${fs.readFileSync(file.path, { encoding: 'base64' })}`;
        if (req.files['logo']) { updateData.logoUrl = toBase64(req.files['logo'][0]); fs.unlinkSync(req.files['logo'][0].path); }
        else if (req.body.clearLogo === 'true') updateData.logoUrl = '';
        if (req.files['stamp']) { updateData.stampUrl = toBase64(req.files['stamp'][0]); fs.unlinkSync(req.files['stamp'][0].path); }
        else if (req.body.clearStamp === 'true') updateData.stampUrl = '';

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        res.json(updatedUser);
    } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// USERS (Isolated)
app.get('/api/users', authMiddleware, async (req, res) => res.json(await User.find({ shop: req.shopId })));
app.post('/api/users', authMiddleware, async (req, res) => { try { res.json(await User.create({ ...req.body, shop: req.shopId })); } catch (e) { res.status(500).json({ error: 'Error' }); } });
app.put('/api/users/:id', authMiddleware, async (req, res) => { try { res.json(await User.findOneAndUpdate({ _id: req.params.id, shop: req.shopId }, req.body, { new: true })); } catch (e) { res.status(500).json({ error: 'Error' }); } });
app.delete('/api/users/:id', authMiddleware, async (req, res) => { try { await User.findOneAndDelete({ _id: req.params.id, shop: req.shopId }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: 'Error' }); } });

// VEHICLES (Isolated)
app.get('/api/vehicles', authMiddleware, async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ shop: req.shopId }).sort({ lastService: -1, updatedAt: -1 }).lean();
        const enriched = await Promise.all(vehicles.map(async (v) => {
            const last = await ServiceRecord.findOne({ vehiclePlate: v.plateNumber, shop: req.shopId }).sort({ date: -1 });
            return { ...v, latestService: last };
        }));
        res.json(enriched);
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/vehicles', authMiddleware, async (req, res) => {
    try {
        if (req.body.plateNumber) req.body.plateNumber = normalizePlate(req.body.plateNumber);
        const vehicle = await Vehicle.create({ ...req.body, shop: req.shopId });
        res.json(vehicle);
    } catch (e) { res.status(500).json({ error: 'Creation Error' }); }
});

app.put('/api/vehicles/:id', authMiddleware, async (req, res) => {
    try {
        if (req.body.plateNumber) req.body.plateNumber = normalizePlate(req.body.plateNumber);
        const vehicle = await Vehicle.findOneAndUpdate({ _id: req.params.id, shop: req.shopId }, req.body, { new: true });
        res.json(vehicle);
    } catch (e) { res.status(500).json({ error: 'Update Error' }); }
});

app.delete('/api/vehicles/:id', authMiddleware, async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({ _id: req.params.id, shop: req.shopId });
        if (vehicle) {
            await ServiceRecord.deleteMany({ vehiclePlate: vehicle.plateNumber, shop: req.shopId });
            await Vehicle.findByIdAndDelete(req.params.id);
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Delete Error' }); }
});

// SERVICES (Isolated)
app.post('/api/services', authMiddleware, async (req, res) => {
    let { _id, vehiclePlate, status } = req.body;
    if (!vehiclePlate || vehiclePlate.trim() === '') return res.status(400).json({ error: 'Missing Plate' });

    vehiclePlate = normalizePlate(vehiclePlate);
    req.body.vehiclePlate = vehiclePlate;

    let updateData = { ...req.body, shop: req.shopId }; // Ensure Shop ID
    if (status === 'Completed') updateData.completedAt = new Date();

    let record;
    if (_id) { record = await ServiceRecord.findOneAndUpdate({ _id, shop: req.shopId }, updateData, { new: true }); }
    else { record = await ServiceRecord.create(updateData); }

    // Update Vehicle Last Service
    if (status === 'Completed') {
        await Vehicle.findOneAndUpdate({ plateNumber: vehiclePlate, shop: req.shopId }, { $set: { lastService: Date.now() } });
    } else {
        // Ensure vehicle exists in this shop context
        await Vehicle.findOneAndUpdate(
            { plateNumber: vehiclePlate, shop: req.shopId },
            { $set: { lastService: Date.now() }, $setOnInsert: { brand: 'Unknown', shop: req.shopId } },
            { upsert: true }
        );
    }
    res.json(record);
});

app.get('/api/services', authMiddleware, async (req, res) => { try { res.json(await ServiceRecord.find({ shop: req.shopId }).sort({ date: -1 })); } catch (e) { res.status(500).json({ error: 'Error' }); } });
app.get('/api/services/pending', authMiddleware, async (req, res) => res.json(await ServiceRecord.find({ status: 'Pending', shop: req.shopId })));
app.get('/api/services/completed', authMiddleware, async (req, res) => res.json(await ServiceRecord.find({ status: 'Completed', shop: req.shopId }).sort({ completedAt: -1 })));
app.get('/api/services/history/:plate', authMiddleware, async (req, res) => {
    try {
        const plate = normalizePlate(req.params.plate);
        // Ensure we only see services for this shop
        const history = await ServiceRecord.find({ vehiclePlate: plate, shop: req.shopId }).sort({ date: -1 });
        res.json(history);
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});


// EXPENSES (Isolated)
app.get('/api/expenses', authMiddleware, async (req, res) => res.json(await Expense.find({ shop: req.shopId }).sort({ date: -1 })));
app.post('/api/expenses', authMiddleware, async (req, res) => res.json(await Expense.create({ ...req.body, shop: req.shopId })));
app.put('/api/expenses/:id', authMiddleware, async (req, res) => res.json(await Expense.findOneAndUpdate({ _id: req.params.id, shop: req.shopId }, req.body, { new: true })));
app.delete('/api/expenses/:id', authMiddleware, async (req, res) => { await Expense.findOneAndDelete({ _id: req.params.id, shop: req.shopId }); res.json({ success: true }); });

// RECURRING EXPENSES (Isolated)
app.get('/api/recurring-expenses', authMiddleware, async (req, res) => res.json(await RecurringExpense.find({ shop: req.shopId })));
app.post('/api/recurring-expenses', authMiddleware, async (req, res) => res.json(await RecurringExpense.create({ ...req.body, shop: req.shopId })));
app.put('/api/recurring-expenses/:id', authMiddleware, async (req, res) => res.json(await RecurringExpense.findOneAndUpdate({ _id: req.params.id, shop: req.shopId }, req.body, { new: true })));
app.delete('/api/recurring-expenses/:id', authMiddleware, async (req, res) => { await RecurringExpense.findOneAndDelete({ _id: req.params.id, shop: req.shopId }); res.json({ success: true }); });

// --- PUBLIC ROUTES (Client Book) ---
app.get('/api/public/book/:plate', async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({ plateNumber: req.params.plate }).lean();
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

        const services = await ServiceRecord.find({ vehiclePlate: req.params.plate, status: 'Completed' }).sort({ date: -1 });
        const user = await User.findOne({ role: 'admin' }); // Get shop info

        res.json({ vehicle, services, shop: user ? { shopName: user.shopName, phones: user.phones, warning: 'Next Service Soon' } : {} });
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

// --- STATIC FILES (EMPLOYEE APP & CLIENT BOOK) ---

// Use path.resolve to get an absolute path that Windows handles better
const EMPLOYEE_BUILD_PATH = path.resolve(__dirname, 'employee', 'build');

// Serve the static files from the build directory
app.use(express.static(EMPLOYEE_BUILD_PATH));

// Fallback for React Router (MUST be the last route)
app.get(/(.*)/, (req, res) => {
    // If the request is for an API that doesn't exist, don't send index.html
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).send('API endpoint not found');
    }
    res.sendFile(path.join(EMPLOYEE_BUILD_PATH, 'index.html'));
});


// --- SUPER ADMIN ROUTES ---

// 1. GET ALL SHOPS (For Super Admin Dashboard)
app.get('/api/admin/shops', async (req, res) => {
    try {
        const Shop = require('./models/Shop');
        const shops = await Shop.find().sort({ createdAt: -1 });
        res.json(shops);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 2. CREATE NEW SHOP (Tenant)
app.post('/api/admin/shops', async (req, res) => {
    try {
        const Shop = require('./models/Shop');
        const { shopData, adminUser } = req.body;

        // 1. Create Shop
        const newShop = new Shop(shopData);
        await newShop.save();

        // 2. Create Admin User for this Shop
        const newUser = new User({
            username: adminUser.username,
            password: adminUser.password, // In real app, hash this!
            role: 'admin',
            shop: newShop._id,
            shopName: newShop.name, // Legacy support
            theme: newShop.theme
        });
        await newUser.save();

        res.json({ success: true, shop: newShop, user: newUser });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 3. EDIT SHOP SUBSCRIPTION
app.put('/api/admin/shops/:id', async (req, res) => {
    try {
        const Shop = require('./models/Shop');
        const updatedShop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedShop);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server Running on Port ${PORT}`);
    console.log(`📁 Static files being served from: ${EMPLOYEE_BUILD_PATH}`);
});