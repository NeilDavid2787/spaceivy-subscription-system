const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Initialize SQLite Database
const db = new sqlite3.Database('./spaceivy_crm.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

// Create tables
function initializeDatabase() {
    const createSubscriptionsTable = `
        CREATE TABLE IF NOT EXISTS subscriptions (
            id TEXT PRIMARY KEY,
            customer_name TEXT NOT NULL,
            email TEXT NOT NULL,
            whatsapp_number TEXT NOT NULL,
            plan_type TEXT NOT NULL,
            original_amount REAL,
            discount REAL DEFAULT 0,
            amount REAL NOT NULL,
            start_date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            end_date TEXT,
            end_time_manual TEXT,
            expiry_date TEXT,
            status TEXT DEFAULT 'active',
            created_at TEXT NOT NULL
        )
    `;

    const createNotificationsTable = `
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            type TEXT NOT NULL,
            subscription_id TEXT,
            message TEXT NOT NULL,
            FOREIGN KEY (subscription_id) REFERENCES subscriptions (id)
        )
    `;

    db.run(createSubscriptionsTable, (err) => {
        if (err) {
            console.error('Error creating subscriptions table:', err.message);
        } else {
            console.log('✅ Subscriptions table ready');
        }
    });

    db.run(createNotificationsTable, (err) => {
        if (err) {
            console.error('Error creating notifications table:', err.message);
        } else {
            console.log('✅ Notifications table ready');
        }
    });
}

// API Routes

// Get all subscriptions
app.get('/api/subscriptions', (req, res) => {
    const query = `
        SELECT * FROM subscriptions 
        ORDER BY created_at DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Convert dates back to Date objects
        const subscriptions = rows.map(row => ({
            ...row,
            startDate: new Date(row.start_date),
            expiryDate: row.expiry_date ? new Date(row.expiry_date) : null,
            createdAt: new Date(row.created_at)
        }));
        
        res.json({ subscriptions });
    });
});

// Get single subscription
app.get('/api/subscriptions/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM subscriptions WHERE id = ?';
    
    db.get(query, [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (!row) {
            res.status(404).json({ error: 'Subscription not found' });
            return;
        }
        
        // Convert dates back to Date objects
        const subscription = {
            ...row,
            startDate: new Date(row.start_date),
            expiryDate: row.expiry_date ? new Date(row.expiry_date) : null,
            createdAt: new Date(row.created_at)
        };
        
        res.json({ subscription });
    });
});

// Create new subscription
app.post('/api/subscriptions', (req, res) => {
    const {
        id, customerName, email, whatsappNumber, planType,
        originalAmount, discount, amount, startDate, startTime, endTime,
        endDate, endTimeManual, expiryDate, status
    } = req.body;

    const query = `
        INSERT INTO subscriptions (
            id, customer_name, email, whatsapp_number, plan_type,
            original_amount, discount, amount, start_date, start_time, end_time,
            end_date, end_time_manual, expiry_date, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        id, customerName, email, whatsappNumber, planType,
        originalAmount || null, discount || 0, amount,
        startDate.toISOString(), startTime, endTime,
        endDate || null, endTimeManual || null,
        expiryDate ? expiryDate.toISOString() : null,
        status || 'active', new Date().toISOString()
    ];

    db.run(query, values, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        res.json({ 
            message: 'Subscription created successfully',
            id: id
        });
    });
});

// Update subscription
app.put('/api/subscriptions/:id', (req, res) => {
    const { id } = req.params;
    const {
        customerName, email, whatsappNumber, planType,
        originalAmount, discount, amount, startDate, startTime, endTime,
        endDate, endTimeManual, expiryDate, status
    } = req.body;

    const query = `
        UPDATE subscriptions SET
            customer_name = ?, email = ?, whatsapp_number = ?, plan_type = ?,
            original_amount = ?, discount = ?, amount = ?, start_date = ?, 
            start_time = ?, end_time = ?, end_date = ?, end_time_manual = ?,
            expiry_date = ?, status = ?
        WHERE id = ?
    `;

    const values = [
        customerName, email, whatsappNumber, planType,
        originalAmount || null, discount || 0, amount,
        startDate.toISOString(), startTime, endTime,
        endDate || null, endTimeManual || null,
        expiryDate ? expiryDate.toISOString() : null,
        status || 'active', id
    ];

    db.run(query, values, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'Subscription not found' });
            return;
        }
        
        res.json({ message: 'Subscription updated successfully' });
    });
});

// Delete subscription
app.delete('/api/subscriptions/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM subscriptions WHERE id = ?';

    db.run(query, [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'Subscription not found' });
            return;
        }
        
        res.json({ message: 'Subscription deleted successfully' });
    });
});

// Get notifications
app.get('/api/notifications', (req, res) => {
    const query = 'SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 50';
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        const notifications = rows.map(row => ({
            ...row,
            timestamp: new Date(row.timestamp)
        }));
        
        res.json({ notifications });
    });
});

// Add notification
app.post('/api/notifications', (req, res) => {
    const { type, subscriptionId, message } = req.body;
    
    const query = `
        INSERT INTO notifications (timestamp, type, subscription_id, message)
        VALUES (?, ?, ?, ?)
    `;
    
    const values = [new Date().toISOString(), type, subscriptionId || null, message];
    
    db.run(query, values, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        res.json({ 
            message: 'Notification added successfully',
            id: this.lastID
        });
    });
});

// Get statistics
app.get('/api/stats', (req, res) => {
    const queries = {
        totalRevenue: 'SELECT SUM(amount) as total FROM subscriptions',
        activeSubscriptions: 'SELECT COUNT(*) as count FROM subscriptions WHERE status = "active"',
        expiringSoon: `
            SELECT COUNT(*) as count FROM subscriptions 
            WHERE status = "active" AND expiry_date IS NOT NULL 
            AND datetime(expiry_date) <= datetime("now", "+1 day")
        `
    };

    const stats = {};
    let completed = 0;
    const total = Object.keys(queries).length;

    Object.keys(queries).forEach(key => {
        db.get(queries[key], [], (err, row) => {
            if (err) {
                console.error(`Error getting ${key}:`, err.message);
                stats[key] = 0;
            } else {
                stats[key] = row.total || row.count || 0;
            }
            
            completed++;
            if (completed === total) {
                res.json({ stats });
            }
        });
    });
});

// Serve the main CRM page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 SpaceIvy CRM Server running on port ${PORT}`);
    console.log(`📱 Access your CRM at: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    });
});
