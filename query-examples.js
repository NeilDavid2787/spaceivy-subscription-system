const sqlite3 = require('sqlite3').verbose();

// Connect to your database
const db = new sqlite3.Database('./spaceivy_crm.db');

console.log('📊 SpaceIvy CRM Data Retrieval Examples\n');

// Example 1: Get all subscriptions
console.log('1️⃣ Getting all subscriptions:');
db.all('SELECT * FROM subscriptions ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
        console.error('Error:', err.message);
    } else {
        console.log(`Found ${rows.length} subscriptions:`);
        rows.forEach(row => {
            console.log(`- ${row.customer_name} (${row.plan_type}) - ₹${row.amount}`);
        });
    }
});

// Example 2: Get subscriptions by plan type
console.log('\n2️⃣ Getting monthly subscriptions only:');
db.all('SELECT * FROM subscriptions WHERE plan_type = "monthly"', [], (err, rows) => {
    if (err) {
        console.error('Error:', err.message);
    } else {
        console.log(`Found ${rows.length} monthly subscriptions:`);
        rows.forEach(row => {
            console.log(`- ${row.customer_name} - ₹${row.amount}`);
        });
    }
});

// Example 3: Get revenue statistics
console.log('\n3️⃣ Revenue statistics:');
db.all(`
    SELECT 
        plan_type,
        COUNT(*) as count,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_amount
    FROM subscriptions 
    GROUP BY plan_type
`, [], (err, rows) => {
    if (err) {
        console.error('Error:', err.message);
    } else {
        console.log('Revenue by plan type:');
        rows.forEach(row => {
            console.log(`- ${row.plan_type}: ${row.count} subs, ₹${row.total_revenue} total, ₹${row.avg_amount.toFixed(2)} avg`);
        });
    }
});

// Example 4: Get expiring subscriptions
console.log('\n4️⃣ Subscriptions expiring in next 7 days:');
db.all(`
    SELECT customer_name, email, whatsapp_number, expiry_date, amount
    FROM subscriptions 
    WHERE status = 'active' 
    AND expiry_date IS NOT NULL 
    AND datetime(expiry_date) <= datetime('now', '+7 days')
    ORDER BY expiry_date
`, [], (err, rows) => {
    if (err) {
        console.error('Error:', err.message);
    } else {
        console.log(`Found ${rows.length} expiring subscriptions:`);
        rows.forEach(row => {
            console.log(`- ${row.customer_name} (${row.whatsapp_number}) expires ${row.expiry_date}`);
        });
    }
});

// Example 5: Get customer contact list
console.log('\n5️⃣ Customer contact list:');
db.all(`
    SELECT DISTINCT customer_name, email, whatsapp_number
    FROM subscriptions 
    ORDER BY customer_name
`, [], (err, rows) => {
    if (err) {
        console.error('Error:', err.message);
    } else {
        console.log(`Found ${rows.length} unique customers:`);
        rows.forEach(row => {
            console.log(`- ${row.customer_name}: ${row.whatsapp_number} | ${row.email}`);
        });
    }
});

// Example 6: Get subscriptions with discounts
console.log('\n6️⃣ Subscriptions with discounts:');
db.all(`
    SELECT customer_name, original_amount, discount, amount
    FROM subscriptions 
    WHERE discount > 0
    ORDER BY discount DESC
`, [], (err, rows) => {
    if (err) {
        console.error('Error:', err.message);
    } else {
        console.log(`Found ${rows.length} discounted subscriptions:`);
        rows.forEach(row => {
            const savings = row.original_amount - row.amount;
            console.log(`- ${row.customer_name}: ₹${row.original_amount} → ₹${row.amount} (${row.discount}% off, saved ₹${savings})`);
        });
    }
});

// Close database after a delay to let queries complete
setTimeout(() => {
    db.close();
    console.log('\n✅ Database connection closed');
}, 2000);
