// File: app.js atau index.js di Railway

const express = require('express');
const app = express();

app.use(express.json());

// Store donasi dalam memory (atau database)
let donations = [];
let checkedDonations = new Set();

// Webhook dari BagiBagi
app.post('/webhook', (req, res) => {
    console.log('[WEBHOOK] Received:', req.body);
    
    const donation = req.body;
    
    if (donation) {
        donations.push({
            donatorName: donation.name || 'Donatur',
            amount: donation.amount || 0,
            message: donation.message || '',
            timestamp: Date.now()
        });
        
        console.log('[WEBHOOK] Stored donation from:', donation.name);
    }
    
    res.json({ success: true });
});

// Endpoint yang dipanggil Roblox untuk cek donasi
app.get('/check-donations', (req, res) => {
    console.log('[CHECK] Roblox checking for donations...');
    
    if (donations.length > 0) {
        const latestDonation = donations[donations.length - 1];
        const donationId = `${latestDonation.donatorName}_${latestDonation.timestamp}`;
        
        // Jika belum pernah di-check, kirim
        if (!checkedDonations.has(donationId)) {
            checkedDonations.add(donationId);
            console.log('[CHECK] Sending donation:', latestDonation);
            
            res.json({
                hasNewDonation: true,
                donatorName: latestDonation.donatorName,
                amount: latestDonation.amount,
                message: latestDonation.message
            });
            
            // Hapus dari queue
            donations.shift();
        } else {
            res.json({ hasNewDonation: false });
        }
    } else {
        res.json({ hasNewDonation: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
