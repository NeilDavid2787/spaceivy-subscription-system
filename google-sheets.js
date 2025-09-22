/**
 * Google Sheets Integration for Spaceivy Subscription System
 * Handles data synchronization with Google Drive spreadsheet
 */

class GoogleSheetsService {
    constructor() {
        this.spreadsheetId = null;
        this.apiKey = null;
        this.isConfigured = false;
    }

    // Configure Google Sheets API
    configure(config) {
        this.spreadsheetId = config.spreadsheetId;
        this.apiKey = config.apiKey;
        this.isConfigured = true;
        console.log('Google Sheets service configured');
    }

    // Create new spreadsheet
    async createSpreadsheet(title = 'Spaceivy Subscriptions') {
        if (!this.isConfigured) {
            console.warn('Google Sheets not configured');
            return null;
        }

        try {
            const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    properties: {
                        title: title
                    },
                    sheets: [{
                        properties: {
                            title: 'Subscriptions',
                            gridProperties: {
                                rowCount: 1000,
                                columnCount: 10
                            }
                        }
                    }]
                })
            });

            const data = await response.json();
            if (data.spreadsheetId) {
                this.spreadsheetId = data.spreadsheetId;
                console.log('Spreadsheet created:', data.spreadsheetUrl);
                return data;
            }
        } catch (error) {
            console.error('Error creating spreadsheet:', error);
        }
        return null;
    }

    // Sync subscriptions to Google Sheets
    async syncSubscriptions(subscriptions) {
        if (!this.isConfigured || !this.spreadsheetId) {
            console.warn('Google Sheets not configured or no spreadsheet ID');
            return false;
        }

        try {
            // Prepare data for sheets
            const headers = [
                'ID', 'Customer Name', 'Email', 'Phone', 'Plan Type', 
                'Amount', 'Start Date', 'End Date', 'Status', 'Created At'
            ];

            const rows = subscriptions.map(sub => [
                sub.id,
                sub.customerName,
                sub.email,
                sub.phone,
                sub.planType,
                sub.amount,
                sub.startDate.toISOString().split('T')[0],
                this.calculateEndDate(sub.startDate, sub.duration).toISOString().split('T')[0],
                this.getStatus(sub.startDate, sub.duration),
                sub.createdAt.toISOString().split('T')[0]
            ]);

            const values = [headers, ...rows];

            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Subscriptions!A1:J${values.length}?valueInputOption=RAW&key=${this.apiKey}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        values: values
                    })
                }
            );

            if (response.ok) {
                console.log('✅ Subscriptions synced to Google Sheets');
                return true;
            } else {
                console.error('Failed to sync to Google Sheets:', response.statusText);
                return false;
            }
        } catch (error) {
            console.error('Error syncing to Google Sheets:', error);
            return false;
        }
    }

    // Helper methods
    calculateEndDate(startDate, duration) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + parseInt(duration));
        return endDate;
    }

    getStatus(startDate, duration) {
        const endDate = this.calculateEndDate(startDate, duration);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        if (daysUntilExpiry < 0) return 'expired';
        if (daysUntilExpiry <= 7) return 'expiring';
        return 'active';
    }

    // Get spreadsheet URL
    getSpreadsheetUrl() {
        if (this.spreadsheetId) {
            return `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}`;
        }
        return null;
    }
}

// Export service
window.GoogleSheetsService = GoogleSheetsService;
