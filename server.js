const express = require('express');
const app = express();

// Middleware untuk parse JSON dan form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Variabel untuk menyimpan donasi terbaru
let latestDonation = null;
let isDonationNew = false;
let donationTimestamp = 0;

console.log('✅ Server starting...');

// Endpoint untuk menerima webhook dari BagiBagi.co
app.post('/webhook', (req, res) => {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📥 WEBHOOK DITERIMA!');
        console.log('Body:', JSON.stringify(req.body, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Ambil data dari berbagai format yang mungkin dikirim
        const donatorName = req.body.donator_name || 
                           req.body.name || 
                           req.body.username || 
                           req.body.donor_name ||
                           "Anonymous";
        
        const amount = parseInt(req.body.amount) || 
                      parseInt(req.body.donation_amount) || 
                      0;
        
        const message = req.body.message || 
                       req.body.note || 
                       req.body.comment || 
                       "";
        
        // Validasi data
        if (amount <= 0) {
            console.warn('⚠️ Amount invalid atau 0');
            return res.status(400).json({
                success: false,
                message: "Amount harus lebih dari 0"
            });
        }
        
        // Simpan data donasi
        latestDonation = {
            donatorName: donatorName,
            amount: amount,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        // Tandai ada donasi baru
        isDonationNew = true;
        donationTimestamp = Date.now();
        
        console.log('✅ Donasi disimpan:', latestDonation);
        
        // Balas webhook dengan status 200
        res.status(200).json({
            success: true,
            message: "Donasi diterima dan disimpan",
            data: latestDonation
        });
    } catch (error) {
        console.error('❌ ERROR di /webhook:', error);
        res.status(500).json({
            success: false,
            message: "Ada error: " + error.message
        });
    }
});

// Endpoint untuk Roblox mengecek donasi baru
app.get('/check-donations', (req, res) => {
    console.log('[CHECK] Roblox mengecek donasi...');
    
    if (isDonationNew && latestDonation) {
        console.log('[CHECK] ✅ Ada donasi baru, mengirim ke Roblox');
        console.log('[CHECK] Data:', latestDonation);
        
        res.json({
            hasNewDonation: true,
            donatorName: latestDonation.donatorName,
            amount: latestDonation.amount,
            message: latestDonation.message,
            timestamp: latestDonation.timestamp
        });
        
        // Reset flag setelah dibaca (penting!)
        isDonationNew = false;
    } else {
        console.log('[CHECK] Tidak ada donasi baru');
        res.json({
            hasNewDonation: false
        });
    }
});

// Endpoint untuk lihat status server
app.get('/', (req, res) => {
    const status = `
        <html>
        <head>
            <title>BagiBagi.co → Roblox Proxy</title>
            <style>
                body { font-family: Arial; margin: 20px; background: #f0f0f0; }
                .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                h1 { color: #333; }
                .status { color: green; font-weight: bold; }
                .info { background: #f9f9f9; padding: 10px; margin: 10px 0; border-left: 4px solid #007bff; }
                pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎉 Proxy Server BagiBagi.co → Roblox</h1>
                <p class="status">Status: ✅ RUNNING</p>
                
                <div class="info">
                    <strong>Webhook URL (untuk BagiBagi.co):</strong>
                    <pre>POST ${req.protocol}://${req.get('host')}/webhook</pre>
                </div>
                
                <div class="info">
                    <strong>Check URL (untuk Roblox):</strong>
                    <pre>GET ${req.protocol}://${req.get('host')}/check-donations</pre>
                </div>
                
                ${latestDonation ? `
                    <div class="info" style="border-left-color: #28a745;">
                        <strong>📦 Donasi Terakhir:</strong>
                        <p><strong>Nama:</strong> ${latestDonation.donatorName}</p>
                        <p><strong>Jumlah:</strong> Rp ${latestDonation.amount.toLocaleString('id-ID')}</p>
                        <p><strong>Pesan:</strong> ${latestDonation.message || '(tidak ada pesan)'}</p>
                        <p><strong>Waktu:</strong> ${latestDonation.timestamp}</p>
                    </div>
                ` : `
                    <div class="info" style="border-left-color: #ffc107;">
                        <strong>⏳ Belum ada donasi</strong>
                    </div>
                `}
            </div>
        </body>
        </html>
    `;
    res.send(status);
});

// Endpoint untuk debug (lihat semua data)
app.get('/debug', (req, res) => {
    res.json({
        latestDonation: latestDonation,
        isDonationNew: isDonationNew,
        donationTimestamp: donationTimestamp,
        serverTime: new Date().toISOString()
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message
    });
});

// Dengarkan di port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server berjalan di port ${PORT}`);
    console.log(`✅ Siap menerima webhook dari BagiBagi.co`);
});
