#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

console.log('🚀 SpaceIvy CRM - Google Sheets Setup Wizard\n');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function setupGoogleSheets() {
    console.log('This wizard will help you set up Google Sheets integration for your CRM.\n');
    
    // Check if .env file exists
    const envExists = fs.existsSync('.env');
    if (envExists) {
        console.log('⚠️  .env file already exists. Backing up to .env.backup');
        fs.copyFileSync('.env', '.env.backup');
    }
    
    console.log('\n📋 Setup Options:');
    console.log('1. Service Account (Recommended for production)');
    console.log('2. API Key (Simpler setup)');
    console.log('3. Skip Google Sheets setup\n');
    
    const choice = await askQuestion('Choose setup option (1-3): ');
    
    let envContent = '';
    
    switch (choice) {
        case '1':
            console.log('\n🔧 Service Account Setup');
            console.log('Please follow the instructions in GOOGLE_SHEETS_SETUP.md to create a service account.\n');
            
            const serviceEmail = await askQuestion('Enter Service Account Email: ');
            const privateKey = await askQuestion('Enter Private Key (full key with \\n): ');
            const spreadsheetId = await askQuestion('Enter Spreadsheet ID (optional, can create later): ');
            
            envContent = `# Google Sheets Service Account Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=${serviceEmail}
GOOGLE_PRIVATE_KEY="${privateKey}"
${spreadsheetId ? `GOOGLE_SPREADSHEET_ID=${spreadsheetId}` : '# GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here'}
`;
            break;
            
        case '2':
            console.log('\n🔧 API Key Setup');
            console.log('Please follow the instructions in GOOGLE_SHEETS_SETUP.md to create an API key.\n');
            
            const apiKey = await askQuestion('Enter Google API Key: ');
            const apiSpreadsheetId = await askQuestion('Enter Spreadsheet ID (optional, can create later): ');
            
            envContent = `# Google Sheets API Key Configuration
GOOGLE_API_KEY=${apiKey}
${apiSpreadsheetId ? `GOOGLE_SPREADSHEET_ID=${apiSpreadsheetId}` : '# GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here'}
`;
            break;
            
        case '3':
            console.log('\n⏭️  Skipping Google Sheets setup');
            console.log('You can set this up later by following GOOGLE_SHEETS_SETUP.md\n');
            rl.close();
            return;
            
        default:
            console.log('\n❌ Invalid choice. Exiting...\n');
            rl.close();
            return;
    }
    
    // Add other environment variables
    envContent += `
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (SQLite)
# Database file will be created automatically as spaceivy_crm.db
`;
    
    // Write .env file
    fs.writeFileSync('.env', envContent);
    console.log('\n✅ .env file created successfully!');
    
    // Ask about creating spreadsheet
    if (choice === '1' || choice === '2') {
        const createNow = await askQuestion('\nWould you like to create a Google Spreadsheet now? (y/n): ');
        
        if (createNow.toLowerCase() === 'y') {
            console.log('\n🚀 Starting server to create spreadsheet...');
            console.log('Once the server starts, visit: http://localhost:3000/api/google-sheets/create');
            console.log('This will create a new Google Spreadsheet with proper headers.\n');
        }
    }
    
    console.log('📚 Next Steps:');
    console.log('1. Run: npm start');
    console.log('2. Visit: http://localhost:3000');
    console.log('3. Add some test subscriptions');
    console.log('4. Check your Google Spreadsheet for automatic sync!\n');
    
    console.log('📖 For detailed instructions, see: GOOGLE_SHEETS_SETUP.md');
    console.log('🛠️  For troubleshooting, check the setup guide.\n');
    
    rl.close();
}

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n\n👋 Setup cancelled. You can run this script again anytime.\n');
    rl.close();
    process.exit(0);
});

// Run the setup
setupGoogleSheets().catch(error => {
    console.error('❌ Setup failed:', error.message);
    rl.close();
    process.exit(1);
});
