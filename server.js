require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Models
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const ServiceRecord = require('./models/ServiceRecord');
const Expense = require('./models/Expense');
const RecurringExpense = require('./models/RecurringExpense');

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
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to DB'))
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

// --- API ROUTES ---
// We place these BEFORE static serving to ensure they are handled correctly

// SETTINGS UPDATE ROUTE
// SETTINGS UPDATE ROUTE (Base64 Storage for Cloud Compatibility)
app.put('/api/settings/:userId', upload.fields([{ name: 'logo' }, { name: 'stamp' }]), async (req, res) => {
    try {
        const { userId } = req.params;
        const { shopName, website, phones } = req.body;

        const updateData = { shopName, website };
        if (phones) updateData.phones = JSON.parse(phones);

        // Helper to convert buffer to base64 data URI
        const toBase64 = (file) => {
            const b64 = fs.readFileSync(file.path, { encoding: 'base64' });
            return `data:${file.mimetype};base64,${b64}`;
        };

        if (req.files['logo']) {
            updateData.logoUrl = toBase64(req.files['logo'][0]);
            // Clean up temp file
            fs.unlinkSync(req.files['logo'][0].path);
        }
        if (req.files['stamp']) {
            updateData.stampUrl = toBase64(req.files['stamp'][0]);
            // Clean up temp file
            fs.unlinkSync(req.files['stamp'][0].path);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Public Service Book Route
app.get('/api/public/book/:plate', async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({ plateNumber: req.params.plate });
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
        const services = await ServiceRecord.find({ vehiclePlate: req.params.plate, status: 'Completed' })
            .select('-price -partsCost')
            .sort({ completedAt: -1 });
        const settings = await User.findOne({ role: 'admin' }).select('shopName logoUrl phones website stampUrl');
        res.json({ vehicle, services, settings });
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
});

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) return res.status(401).json({ success: false });
        res.json({ success: true, user });
    } catch (e) { res.status(500).json({ error: 'Login Error' }); }
});

// Generic API Endpoints
app.get('/api/users', async (req, res) => res.json(await User.find()));
app.get('/api/vehicles', async (req, res) => {
    try {
        const vehicles = await Vehicle.find().sort({ lastService: -1, updatedAt: -1 }).lean();
        const enriched = await Promise.all(vehicles.map(async (v) => {
            const last = await ServiceRecord.findOne({ vehiclePlate: v.plateNumber }).sort({ date: -1 });
            return { ...v, latestService: last };
        }));
        res.json(enriched);
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

// Vehicle CRUD
app.post('/api/vehicles', async (req, res) => {
    try {
        const vehicle = await Vehicle.create(req.body);
        res.json(vehicle);
    } catch (e) { res.status(500).json({ error: 'Creation Error' }); }
});

app.put('/api/vehicles/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(vehicle);
    } catch (e) { res.status(500).json({ error: 'Update Error' }); }
});

app.delete('/api/vehicles/:id', async (req, res) => {
    try {
        await Vehicle.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Delete Error' }); }
});

app.post('/api/services', async (req, res) => {
    const { _id, vehiclePlate, status } = req.body;
    let record;
    if (_id) { record = await ServiceRecord.findByIdAndUpdate(_id, req.body, { new: true }); }
    else { record = await ServiceRecord.create(req.body); }
    if (status === 'Completed') await Vehicle.findOneAndUpdate({ plateNumber: vehiclePlate }, { lastService: Date.now() });
    res.json(record);
});

app.get('/api/services/pending', async (req, res) => res.json(await ServiceRecord.find({ status: 'Pending' })));

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

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server Running on Port ${PORT}`);
    console.log(`📁 Static files being served from: ${EMPLOYEE_BUILD_PATH}`);
});