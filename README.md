# 🚀 SpaceIvy CRM - Database Edition

A powerful subscription management CRM for coworking spaces with database backend.

## ✨ Features

- **📊 Real-time Dashboard**: Track revenue, active subscriptions, and expiring contracts
- **💰 Smart Billing**: Automatic calculation with SpaceIvy's stepped pricing structure
- **📅 Flexible Expiry**: Auto-calculated or manual end dates
- **💸 Discount System**: Percentage discounts for monthly plans only
- **📱 Contact Management**: Easy access to customer phone numbers
- **📈 Export & Analytics**: Comprehensive data export and reporting
- **🗄️ Database Storage**: SQLite database for reliable data persistence

## 🏗️ Architecture

### Backend (Node.js + SQLite)
- **Express.js** web server
- **SQLite** database for data persistence
- **RESTful API** for all operations
- **CORS enabled** for frontend integration

### Frontend (Vanilla JavaScript)
- **Responsive design** with modern UI
- **Real-time updates** via API calls
- **Offline fallback** to localStorage
- **Form validation** and user feedback

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Access Your CRM**
   Open your browser and go to: `http://localhost:3000`

## 📊 Database Management

### Database Utilities

The included `database-utils.js` provides powerful database management tools:

```bash
# Migrate data from JSON backup to database
node database-utils.js migrate ./backup.json

# Export all data to JSON
node database-utils.js export ./export.json

# Backup database file
node database-utils.js backup ./backup.db

# Show database statistics
node database-utils.js stats
```

### Data Migration from localStorage

If you have existing data in localStorage, you can migrate it:

1. Export your localStorage data as JSON
2. Run the migration command:
   ```bash
   node database-utils.js migrate your-data.json
   ```

## 🗄️ Database Schema

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
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
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    type TEXT NOT NULL,
    subscription_id TEXT,
    message TEXT NOT NULL,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions (id)
);
```

## 🔌 API Endpoints

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `GET /api/subscriptions/:id` - Get single subscription
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription

### Statistics
- `GET /api/stats` - Get dashboard statistics

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Add notification

## 💰 Billing Structure

The CRM implements SpaceIvy's exact pricing structure:

- **Hourly**: ₹75 per hour (any partial hour = full hour)
- **Half Day**: ₹300 base (5 hours) + ₹75/hr for extra hours
- **Work Day**: ₹500 base (8 hours) + ₹75/hr for extra hours
- **Full Day**: ₹600 flat rate (10+ hours)
- **Weekly**: 6 days from start date
- **Monthly**: 30 days from start date

### Discount System
- **Monthly Plans Only**: Discount field only works for monthly subscriptions
- **Percentage Based**: Enter discount as percentage (e.g., 10 for 10%)
- **Automatic Calculation**: Final amount calculated in real-time
- **Visual Feedback**: Original amount shown with strikethrough when discounted

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

### Database Location
- Database file: `./spaceivy_crm.db`
- Automatically created on first run
- Backup regularly using the utility scripts

## 📱 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
```bash
npm start
```

### Hostinger Deployment
1. Upload all files to your Hostinger directory
2. Run `npm install` on the server
3. Start with `npm start`
4. Configure your domain to point to the application

## 🔒 Data Security

- **Local Database**: SQLite file stored on your server
- **No External Dependencies**: All data stays on your infrastructure
- **Regular Backups**: Use the utility scripts for data backup
- **Export Options**: Multiple export formats for data portability

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check file permissions for database directory
   - Ensure SQLite3 is properly installed

2. **API Not Responding**
   - Check if server is running on correct port
   - Verify CORS settings for frontend access

3. **Data Not Loading**
   - Check browser console for API errors
   - Verify database file exists and is readable

### Logs
- Server logs appear in the terminal where you started the server
- Browser console shows frontend API call logs
- Database operations are logged to console

## 📈 Performance

- **SQLite**: Fast, lightweight database perfect for single-user CRM
- **Indexed Queries**: Optimized database queries for quick data retrieval
- **Efficient API**: RESTful endpoints with minimal overhead
- **Caching**: Frontend caches data for smooth user experience

## 🔄 Backup Strategy

1. **Daily Database Backup**
   ```bash
   node database-utils.js backup ./daily-backup.db
   ```

2. **Weekly JSON Export**
   ```bash
   node database-utils.js export ./weekly-export.json
   ```

3. **Automated Backups**: Set up cron jobs for regular backups

## 📞 Support

For technical support or feature requests, please contact the development team.

---

**SpaceIvy CRM** - Built with ❤️ for efficient subscription management