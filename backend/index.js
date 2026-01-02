const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin (requires serviceAccountKey.json)
try {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(), // Or path to json
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    console.log("Firebase Admin Initialized");
} catch (e) {
    console.warn("Firebase Admin failed to start (likely missing credentials). Use this for custom server tasks.");
}

app.get('/', (req, res) => {
    res.send('PharmaCI Backend API is running... 🚀');
});

// Example route for SMS notification
app.post('/api/notify-order', async (req, res) => {
    const { orderId, phoneNumber } = req.body;
    console.log(`Sending SMS for order ${orderId} to ${phoneNumber}`);
    // Integration with Twilio or local gateway would go here
    res.json({ success: true, message: "Notification sent (Mock)" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
