# 📊 Google Sheets Integration Setup Guide

This guide will help you set up automatic synchronization between your SpaceIvy CRM and Google Sheets.

## 🎯 Benefits

- ✅ **Automatic Backup**: All subscriptions automatically sync to Google Sheets
- ✅ **Real-time Updates**: Changes appear instantly in your spreadsheet
- ✅ **Easy Sharing**: Share data with team members via Google Sheets
- ✅ **Mobile Access**: View and edit data on mobile via Google Sheets app
- ✅ **Built-in Analytics**: Use Google Sheets charts and pivot tables
- ✅ **Collaboration**: Multiple people can view/edit the same data
- ✅ **Cloud Storage**: Data backed up in Google Drive

## 🔧 Setup Options

### Option 1: Service Account (Recommended for Production)

**Step 1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API

**Step 2: Create Service Account**
1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Name: `spaceivy-crm-service`
4. Click "Create and Continue"
5. Skip roles for now, click "Done"

**Step 3: Generate Key**
1. Click on your service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the JSON file

**Step 4: Configure Environment Variables**
Create a `.env` file in your project root:
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
```

### Option 2: API Key (Simpler Setup)

**Step 1: Enable Google Sheets API**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Sheets API
3. Go to "Credentials"
4. Click "Create Credentials" > "API Key"
5. Copy the API key

**Step 2: Configure Environment Variables**
```env
GOOGLE_API_KEY=your_api_key_here
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
```

### Option 3: OAuth2 (User Authentication)

**Step 1: Create OAuth2 Credentials**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to "Credentials"
3. Click "Create Credentials" > "OAuth client ID"
4. Choose "Web application"
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`

**Step 2: Configure Environment Variables**
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create `.env` file with your Google credentials (see options above).

### 3. Start Your CRM
```bash
npm start
```

### 4. Create Google Spreadsheet
Visit: `http://localhost:3000/api/google-sheets/create`

This will create a new Google Spreadsheet with proper headers.

### 5. Sync Existing Data
Visit: `http://localhost:3000/api/google-sheets/sync`

This will sync all your existing subscriptions to Google Sheets.

## 📊 Using Your Google Spreadsheet

### Automatic Features
- **Real-time Sync**: New subscriptions automatically appear
- **Formatted Headers**: Professional-looking column headers
- **Data Validation**: Consistent data format
- **Auto-updates**: Changes reflect immediately

### Manual Features You Can Add
- **Charts**: Create revenue charts, subscription trends
- **Pivot Tables**: Analyze data by plan type, date ranges
- **Filters**: Filter by customer, plan type, status
- **Conditional Formatting**: Highlight expiring subscriptions
- **Formulas**: Calculate totals, averages, growth rates

### Example Formulas
```excel
=SUMIF(F:F,"monthly",H:H)  // Total monthly revenue
=COUNTIF(F:F,"active")     // Count active subscriptions
=TODAY()-J2                // Days since start date
```

## 🔄 Sync Operations

### Automatic Sync
- ✅ New subscriptions added
- ✅ Subscription updates
- ✅ Subscription deletions

### Manual Sync
- **Full Sync**: `/api/google-sheets/sync` - Syncs all data
- **Status Check**: `/api/google-sheets/status` - Check connection
- **Create Sheet**: `/api/google-sheets/create` - Create new spreadsheet

## 📱 Mobile Access

1. **Install Google Sheets App** on your phone
2. **Open your spreadsheet** from the shared link
3. **View real-time data** as it updates
4. **Filter and search** through subscriptions
5. **Share with team members** easily

## 🛠️ Troubleshooting

### Common Issues

**1. "Google Sheets not configured"**
- Check your `.env` file
- Verify environment variables are set
- Restart the server after adding env vars

**2. "Permission denied"**
- Ensure service account has access to spreadsheet
- Share spreadsheet with service account email
- Check API keys are valid

**3. "Spreadsheet not found"**
- Verify `GOOGLE_SPREADSHEET_ID` is correct
- Make sure spreadsheet exists and is accessible

### Debug Commands
```bash
# Check Google Sheets status
curl http://localhost:3000/api/google-sheets/status

# Test spreadsheet creation
curl -X POST http://localhost:3000/api/google-sheets/create

# Test data sync
curl -X POST http://localhost:3000/api/google-sheets/sync
```

## 🔒 Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use service account** for production
3. **Limit API key permissions** to necessary scopes only
4. **Regularly rotate credentials**
5. **Monitor API usage** in Google Cloud Console

## 📈 Advanced Features

### Custom Spreadsheet Templates
Create your own spreadsheet template with:
- Pre-configured charts
- Pivot tables
- Conditional formatting
- Custom formulas

### Multiple Spreadsheets
You can sync to multiple spreadsheets:
- One for active subscriptions
- One for revenue tracking
- One for customer analytics

### Scheduled Syncs
Set up cron jobs for:
- Daily backup syncs
- Weekly reports
- Monthly summaries

## 🎉 Success!

Once set up, your CRM will automatically:
1. **Create new rows** when you add subscriptions
2. **Update existing rows** when you modify subscriptions
3. **Delete rows** when you remove subscriptions
4. **Maintain data integrity** between database and sheets

Your data is now backed up in the cloud and easily accessible from anywhere! 🚀

---

**Need Help?** Check the troubleshooting section or contact support.
