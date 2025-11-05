const express = require('express');
const app = express();

app.use(express.json());

let latestDonation = null;
let isDonationNew = false;

// Endpoint untuk menerima webhook dari BagiBagi.co
app.post('/webhook', (req, res) => {
    try {
        console.log('Webhook diterima:', req.body);
        
        latestDonation = {
            donatorName: req.body.donator_name || req.body.name || "Anonymous",
            amount: req.body.amount || 0,
            message: req.body.message || "",
            timestamp: new Date().toISOString()
        };
        
        isDonationNew = true;
        
        res.status(200).json({
            success: true,
            message: "Donasi diterima"
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: "Ada error"
        });
    }
});

// Endpoint untuk Roblox cek donasi baru
app.get('/check-donations', (req, res) => {
    if (isDonationNew && latestDonation) {
        res.json({
            hasNewDonation: true,
            donatorName: latestDonation.donatorName,
            amount: latestDonation.amount,
            message: latestDonation.message,
            timestamp: latestDonation.timestamp
        });
        
        isDonationNew = false;
    } else {
        res.json({
            hasNewDonation: false
        });
    }
});

// Halaman test
app.get('/', (req, res) => {
    res.send(`
        <h1>Proxy Server untuk BagiBagi.co → Roblox</h1>
        <p>Status: ✅ Running</p>
        <p>Webhook URL: POST ${req.protocol}://${req.get('host')}/webhook</p>
        <p>Check URL: GET ${req.protocol}://${req.get('host')}/check-donations</p>
        ${latestDonation ? `<p>Donasi terakhir: ${latestDonation.donatorName} - Rp ${latestDonation.amount}</p>` : '<p>Belum ada donasi</p>'}
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server berjalan di port ${PORT}`);
});
