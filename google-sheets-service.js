const { google } = require('googleapis');

class GoogleSheetsService {
    constructor() {
        this.auth = null;
        this.sheets = null;
        this.spreadsheetId = null;
        this.sheetName = 'SpaceIvy CRM';
        
        // Initialize with environment variables or config
        this.initializeAuth();
    }

    // Initialize Google Sheets authentication
    initializeAuth() {
        try {
            // Option 1: Service Account (Recommended for production)
            if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
                this.auth = new google.auth.GoogleAuth({
                    credentials: {
                        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
                    },
                    scopes: ['https://www.googleapis.com/auth/spreadsheets']
                });
            }
            // Option 2: API Key (Simpler setup)
            else if (process.env.GOOGLE_API_KEY) {
                this.auth = new google.auth.GoogleAuth({
                    apiKey: process.env.GOOGLE_API_KEY,
                    scopes: ['https://www.googleapis.com/auth/spreadsheets']
                });
            }
            // Option 3: OAuth2 (For user authentication)
            else if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
                this.auth = new google.auth.OAuth2(
                    process.env.GOOGLE_CLIENT_ID,
                    process.env.GOOGLE_CLIENT_SECRET,
                    'http://localhost:3000/auth/google/callback'
                );
            }

            if (this.auth) {
                this.sheets = google.sheets({ version: 'v4', auth: this.auth });
                this.spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
                console.log('✅ Google Sheets service initialized');
            } else {
                console.log('⚠️ Google Sheets not configured - check environment variables');
            }
        } catch (error) {
            console.error('❌ Error initializing Google Sheets:', error.message);
        }
    }

    // Create a new spreadsheet
    async createSpreadsheet(title = 'SpaceIvy CRM Subscriptions') {
        try {
            if (!this.sheets) {
                throw new Error('Google Sheets not initialized');
            }

            const resource = {
                properties: {
                    title: title
                },
                sheets: [{
                    properties: {
                        title: this.sheetName,
                        gridProperties: {
                            rowCount: 1000,
                            columnCount: 20
                        }
                    }
                }]
            };

            const response = await this.sheets.spreadsheets.create({
                resource: resource
            });

            this.spreadsheetId = response.data.spreadsheetId;
            console.log(`✅ Created new spreadsheet: ${response.data.spreadsheetUrl}`);
            
            // Set up headers
            await this.setupHeaders();
            
            return {
                spreadsheetId: this.spreadsheetId,
                url: response.data.spreadsheetUrl
            };
        } catch (error) {
            console.error('❌ Error creating spreadsheet:', error.message);
            throw error;
        }
    }

    // Set up column headers
    async setupHeaders() {
        try {
            const headers = [
                'ID', 'Customer Name', 'Email', 'Phone', 'Plan Type',
                'Original Amount', 'Discount %', 'Final Amount', 'Start Date',
                'Start Time', 'End Time', 'End Date', 'End Time Manual',
                'Expiry Date', 'Expiry Time', 'Status', 'Created At',
                'Billable Hours', 'Rate Applied', 'Expiry Type'
            ];

            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${this.sheetName}!A1:T1`,
                valueInputOption: 'RAW',
                resource: {
                    values: [headers]
                }
            });

            // Format headers
            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: {
                    requests: [{
                        repeatCell: {
                            range: {
                                sheetId: 0,
                                startRowIndex: 0,
                                endRowIndex: 1
                            },
                            cell: {
                                userEnteredFormat: {
                                    backgroundColor: {
                                        red: 0.2,
                                        green: 0.6,
                                        blue: 0.4
                                    },
                                    textFormat: {
                                        foregroundColor: {
                                            red: 1,
                                            green: 1,
                                            blue: 1
                                        },
                                        bold: true
                                    }
                                }
                            },
                            fields: 'userEnteredFormat(backgroundColor,textFormat)'
                        }
                    }]
                }
            });

            console.log('✅ Headers set up successfully');
        } catch (error) {
            console.error('❌ Error setting up headers:', error.message);
            throw error;
        }
    }

    // Add or update a subscription
    async addSubscription(subscription) {
        try {
            if (!this.sheets || !this.spreadsheetId) {
                throw new Error('Google Sheets not configured');
            }

            // First, check if subscription already exists
            const existingRow = await this.findSubscriptionRow(subscription.id);
            
            if (existingRow !== -1) {
                // Update existing row
                await this.updateSubscriptionRow(existingRow, subscription);
                console.log(`✅ Updated subscription ${subscription.id} in row ${existingRow + 1}`);
            } else {
                // Add new row
                await this.appendSubscriptionRow(subscription);
                console.log(`✅ Added subscription ${subscription.id} to Google Sheets`);
            }
        } catch (error) {
            console.error('❌ Error adding subscription to sheets:', error.message);
            throw error;
        }
    }

    // Find row number for existing subscription
    async findSubscriptionRow(subscriptionId) {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${this.sheetName}!A:A`
            });

            const values = response.data.values || [];
            for (let i = 0; i < values.length; i++) {
                if (values[i][0] === subscriptionId) {
                    return i;
                }
            }
            return -1;
        } catch (error) {
            console.error('❌ Error finding subscription row:', error.message);
            return -1;
        }
    }

    // Append new subscription row
    async appendSubscriptionRow(subscription) {
        try {
            const rowData = this.formatSubscriptionForSheets(subscription);
            
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: `${this.sheetName}!A:T`,
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: [rowData]
                }
            });
        } catch (error) {
            console.error('❌ Error appending subscription row:', error.message);
            throw error;
        }
    }

    // Update existing subscription row
    async updateSubscriptionRow(rowIndex, subscription) {
        try {
            const rowData = this.formatSubscriptionForSheets(subscription);
            
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${this.sheetName}!A${rowIndex + 1}:T${rowIndex + 1}`,
                valueInputOption: 'RAW',
                resource: {
                    values: [rowData]
                }
            });
        } catch (error) {
            console.error('❌ Error updating subscription row:', error.message);
            throw error;
        }
    }

    // Format subscription data for Google Sheets
    formatSubscriptionForSheets(subscription) {
        const expiryDate = subscription.expiryDate ? new Date(subscription.expiryDate) : null;
        const expiryTime = expiryDate ? expiryDate.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}) : '';
        const expiryType = (subscription.endDate || subscription.endTimeManual) ? 'Manual' : 'Auto';
        
        return [
            subscription.id,
            subscription.customerName,
            subscription.email,
            subscription.whatsappNumber,
            subscription.planType,
            subscription.originalAmount || subscription.amount,
            subscription.discount || 0,
            subscription.amount,
            subscription.startDate.toISOString().split('T')[0],
            subscription.startTime,
            subscription.endTime,
            subscription.endDate || '',
            subscription.endTimeManual || '',
            expiryDate ? expiryDate.toISOString().split('T')[0] : '',
            expiryTime,
            subscription.status,
            subscription.createdAt.toISOString(),
            '', // Billable Hours (calculated later)
            '', // Rate Applied (calculated later)
            expiryType
        ];
    }

    // Delete subscription from sheets
    async deleteSubscription(subscriptionId) {
        try {
            const rowIndex = await this.findSubscriptionRow(subscriptionId);
            if (rowIndex === -1) {
                console.log(`⚠️ Subscription ${subscriptionId} not found in sheets`);
                return;
            }

            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: {
                    requests: [{
                        deleteDimension: {
                            range: {
                                sheetId: 0,
                                dimension: 'ROWS',
                                startIndex: rowIndex,
                                endIndex: rowIndex + 1
                            }
                        }
                    }]
                }
            });

            console.log(`✅ Deleted subscription ${subscriptionId} from sheets`);
        } catch (error) {
            console.error('❌ Error deleting subscription from sheets:', error.message);
            throw error;
        }
    }

    // Sync all subscriptions from database to sheets
    async syncAllSubscriptions(subscriptions) {
        try {
            if (!this.sheets || !this.spreadsheetId) {
                throw new Error('Google Sheets not configured');
            }

            console.log(`🔄 Syncing ${subscriptions.length} subscriptions to Google Sheets...`);

            // Clear existing data (except headers)
            await this.sheets.spreadsheets.values.clear({
                spreadsheetId: this.spreadsheetId,
                range: `${this.sheetName}!A2:T1000`
            });

            // Add all subscriptions
            const rows = subscriptions.map(sub => this.formatSubscriptionForSheets(sub));
            
            if (rows.length > 0) {
                await this.sheets.spreadsheets.values.update({
                    spreadsheetId: this.spreadsheetId,
                    range: `${this.sheetName}!A2:T${rows.length + 1}`,
                    valueInputOption: 'RAW',
                    resource: {
                        values: rows
                    }
                });
            }

            console.log(`✅ Synced ${subscriptions.length} subscriptions to Google Sheets`);
        } catch (error) {
            console.error('❌ Error syncing subscriptions:', error.message);
            throw error;
        }
    }

    // Get spreadsheet URL
    getSpreadsheetUrl() {
        if (this.spreadsheetId) {
            return `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}`;
        }
        return null;
    }

    // Check if service is configured
    isConfigured() {
        return !!(this.auth && this.sheets && this.spreadsheetId);
    }
}

module.exports = GoogleSheetsService;
