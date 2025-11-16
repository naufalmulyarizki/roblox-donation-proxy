// File: app.js atau index.js di Railway

const express = require('express');
const app = express();

app.use(express.json());

// Queue system untuk donasi (FIFO - First In First Out)
class DonationQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }
    
    // Tambah donasi ke queue
    enqueue(donation) {
        this.queue.push({
            id: `${donation.donatorName}_${Date.now()}`,
            donatorName: donation.donatorName,
            amount: donation.amount,
            message: donation.message,
            timestamp: Date.now(),
            processed: false
        });
        console.log(`[QUEUE] Added to queue. Total items: ${this.queue.length}`);
    }
    
    // Ambil donasi pertama yang belum diproses
    dequeue() {
        // Cari donasi pertama yang belum diproses
        const index = this.queue.findIndex(d => !d.processed);
        
        if (index !== -1) {
            const donation = this.queue[index];
            donation.processed = true;
            console.log(`[QUEUE] Dequeued donation ${index + 1}/${this.queue.length}`);
            return donation;
        }
        
        return null;
    }
    
    // Bersihkan donasi yang sudah diproses (setiap 5 menit)
    cleanup() {
        const beforeCount = this.queue.length;
        this.queue = this.queue.filter(d => !d.processed);
        const afterCount = this.queue.length;
        
        if (beforeCount !== afterCount) {
            console.log(`[QUEUE] Cleaned ${beforeCount - afterCount} processed donations`);
        }
    }
    
    // Cek apakah ada donasi yang belum diproses
    hasUnprocessed() {
        return this.queue.some(d => !d.processed);
    }
    
    // Dapatkan status queue
    getStatus() {
        const unprocessed = this.queue.filter(d => !d.processed).length;
        return {
            total: this.queue.length,
            unprocessed: unprocessed,
            processed: this.queue.length - unprocessed
        };
    }
}

const donationQueue = new DonationQueue();

// Cleanup otomatis setiap 5 menit
setInterval(() => {
    donationQueue.cleanup();
}, 5 * 60 * 1000);

// Webhook dari BagiBagi
app.post('/webhook', (req, res) => {
    console.log('[WEBHOOK] Received:', req.body);
    
    const donation = req.body;
    
    if (donation) {
        donationQueue.enqueue({
            donatorName: donation.name || 'Donatur',
            amount: donation.amount || 0,
            message: donation.message || ''
        });
        
        const status = donationQueue.getStatus();
        console.log(`[WEBHOOK] Queue status - Total: ${status.total}, Unprocessed: ${status.unprocessed}`);
    }
    
    res.json({ success: true });
});

// Endpoint yang dipanggil Roblox untuk cek donasi (FIFO queue)
app.get('/check-donations', (req, res) => {
    console.log('[CHECK] Roblox checking for donations...');
    
    const status = donationQueue.getStatus();
    console.log(`[CHECK] Queue status - Total: ${status.total}, Unprocessed: ${status.unprocessed}`);
    
    if (donationQueue.hasUnprocessed()) {
        const donation = donationQueue.dequeue();
        
        if (donation) {
            console.log(`[CHECK] Sending donation from: ${donation.donatorName}`);
            
            res.json({
                hasNewDonation: true,
                donatorName: donation.donatorName,
                amount: donation.amount,
                message: donation.message,
                queuePosition: status.unprocessed,
                totalInQueue: status.total
            });
        } else {
            res.json({ hasNewDonation: false });
        }
    } else {
        res.json({ hasNewDonation: false });
    }
});

// Endpoint untuk cek status queue (opsional, untuk debugging)
app.get('/queue-status', (req, res) => {
    const status = donationQueue.getStatus();
    res.json({
        ...status,
        queue: donationQueue.queue.map((d, idx) => ({
            position: idx + 1,
            donatorName: d.donatorName,
            amount: d.amount,
            processed: d.processed,
            timestamp: new Date(d.timestamp).toISOString()
        }))
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Donation queue system initialized with FIFO processing`);
});
