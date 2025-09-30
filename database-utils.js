const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Database utility functions
class DatabaseUtils {
    constructor(dbPath = './spaceivy_crm.db') {
        this.dbPath = dbPath;
    }

    // Migrate data from localStorage JSON to database
    async migrateFromJSON(jsonFilePath) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            
            try {
                // Read JSON file
                const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
                const subscriptions = jsonData.subscriptions || [];
                
                console.log(`📦 Found ${subscriptions.length} subscriptions to migrate`);
                
                let migrated = 0;
                let errors = 0;
                
                subscriptions.forEach((sub, index) => {
                    const query = `
                        INSERT OR REPLACE INTO subscriptions (
                            id, customer_name, email, whatsapp_number, plan_type,
                            original_amount, discount, amount, start_date, start_time, end_time,
                            end_date, end_time_manual, expiry_date, status, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    
                    const values = [
                        sub.id,
                        sub.customerName,
                        sub.email,
                        sub.phone || sub.whatsappNumber,
                        sub.planType,
                        sub.originalAmount || sub.amount,
                        sub.discount || 0,
                        sub.amount,
                        sub.startDate,
                        sub.startTime || '09:00',
                        sub.endTime || '17:00',
                        sub.endDate || null,
                        sub.endTimeManual || null,
                        sub.expiryDate || null,
                        sub.status || 'active',
                        sub.createdAt
                    ];
                    
                    db.run(query, values, function(err) {
                        if (err) {
                            console.error(`❌ Error migrating subscription ${sub.id}:`, err.message);
                            errors++;
                        } else {
                            migrated++;
                        }
                        
                        if (index === subscriptions.length - 1) {
                            db.close();
                            console.log(`✅ Migration complete: ${migrated} migrated, ${errors} errors`);
                            resolve({ migrated, errors });
                        }
                    });
                });
                
            } catch (error) {
                console.error('❌ Migration failed:', error.message);
                db.close();
                reject(error);
            }
        });
    }

    // Export all data to JSON
    async exportToJSON(outputPath) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            
            const query = 'SELECT * FROM subscriptions ORDER BY created_at DESC';
            
            db.all(query, [], (err, rows) => {
                if (err) {
                    console.error('❌ Export failed:', err.message);
                    reject(err);
                    return;
                }
                
                const exportData = {
                    subscriptions: rows.map(row => ({
                        id: row.id,
                        customerName: row.customer_name,
                        email: row.email,
                        phone: row.whatsapp_number,
                        whatsappNumber: row.whatsapp_number,
                        planType: row.plan_type,
                        originalAmount: row.original_amount,
                        discount: row.discount,
                        amount: row.amount,
                        startDate: row.start_date,
                        startTime: row.start_time,
                        endTime: row.end_time,
                        endDate: row.end_date,
                        endTimeManual: row.end_time_manual,
                        expiryDate: row.expiry_date,
                        status: row.status,
                        createdAt: row.created_at
                    })),
                    exportDate: new Date().toISOString(),
                    currentDate: new Date().toISOString()
                };
                
                fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
                console.log(`✅ Exported ${rows.length} subscriptions to ${outputPath}`);
                
                db.close();
                resolve(exportData);
            });
        });
    }

    // Backup database
    async backupDatabase(backupPath) {
        return new Promise((resolve, reject) => {
            try {
                fs.copyFileSync(this.dbPath, backupPath);
                console.log(`✅ Database backed up to ${backupPath}`);
                resolve(backupPath);
            } catch (error) {
                console.error('❌ Backup failed:', error.message);
                reject(error);
            }
        });
    }

    // Get database statistics
    async getStats() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            
            const queries = {
                totalSubscriptions: 'SELECT COUNT(*) as count FROM subscriptions',
                totalRevenue: 'SELECT SUM(amount) as total FROM subscriptions',
                activeSubscriptions: 'SELECT COUNT(*) as count FROM subscriptions WHERE status = "active"',
                monthlyPlans: 'SELECT COUNT(*) as count FROM subscriptions WHERE plan_type = "monthly"',
                withDiscounts: 'SELECT COUNT(*) as count FROM subscriptions WHERE discount > 0'
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
                        db.close();
                        resolve(stats);
                    }
                });
            });
        });
    }
}

// CLI usage
if (require.main === module) {
    const utils = new DatabaseUtils();
    const command = process.argv[2];
    
    switch (command) {
        case 'migrate':
            const jsonFile = process.argv[3] || './spaceivy-subscriptions-backup.json';
            utils.migrateFromJSON(jsonFile)
                .then(result => console.log('Migration result:', result))
                .catch(err => console.error('Migration error:', err));
            break;
            
        case 'export':
            const outputFile = process.argv[3] || `./spaceivy-export-${new Date().toISOString().split('T')[0]}.json`;
            utils.exportToJSON(outputFile)
                .then(result => console.log('Export result:', result))
                .catch(err => console.error('Export error:', err));
            break;
            
        case 'backup':
            const backupFile = process.argv[3] || `./spaceivy-backup-${new Date().toISOString().split('T')[0]}.db`;
            utils.backupDatabase(backupFile)
                .then(result => console.log('Backup result:', result))
                .catch(err => console.error('Backup error:', err));
            break;
            
        case 'stats':
            utils.getStats()
                .then(result => {
                    console.log('📊 Database Statistics:');
                    console.log(`Total Subscriptions: ${result.totalSubscriptions}`);
                    console.log(`Total Revenue: ₹${result.totalRevenue}`);
                    console.log(`Active Subscriptions: ${result.activeSubscriptions}`);
                    console.log(`Monthly Plans: ${result.monthlyPlans}`);
                    console.log(`With Discounts: ${result.withDiscounts}`);
                })
                .catch(err => console.error('Stats error:', err));
            break;
            
        default:
            console.log(`
🗄️  SpaceIvy CRM Database Utils

Usage:
  node database-utils.js migrate [json-file]     - Migrate from JSON to database
  node database-utils.js export [output-file]    - Export database to JSON
  node database-utils.js backup [backup-file]    - Backup database file
  node database-utils.js stats                   - Show database statistics

Examples:
  node database-utils.js migrate ./backup.json
  node database-utils.js export ./export.json
  node database-utils.js backup ./backup.db
  node database-utils.js stats
            `);
    }
}

module.exports = DatabaseUtils;
