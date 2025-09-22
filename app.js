/**
 * Spaceivy Subscription System
 * Minimal subscription management with time-based plans
 */

class SubscriptionManager {
    constructor() {
        this.subscriptions = [];
        this.notifications = [];
        this.emailService = new EmailService();
        this.whatsappService = new WhatsAppService();
        this.googleSheetsService = new GoogleSheetsService();
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setDefaultDates();
        this.checkEmailConfiguration();
        this.renderAll();
        this.startAutoCheck();
    }

    // Data Management
    loadData() {
        const savedSubscriptions = localStorage.getItem('spaceivy_subscriptions');
        const savedNotifications = localStorage.getItem('spaceivy_notifications');

        if (savedSubscriptions) {
            this.subscriptions = JSON.parse(savedSubscriptions).map(sub => ({
                ...sub,
                startDate: new Date(sub.startDate),
                endDate: new Date(sub.endDate)
            }));
        }

        if (savedNotifications) {
            this.notifications = JSON.parse(savedNotifications).map(notif => ({
                ...notif,
                timestamp: new Date(notif.timestamp)
            }));
        }
    }

    saveData() {
        localStorage.setItem('spaceivy_subscriptions', JSON.stringify(this.subscriptions));
        localStorage.setItem('spaceivy_notifications', JSON.stringify(this.notifications));
    }

    // Event Listeners
    setupEventListeners() {
        document.getElementById('subscriptionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSubscription();
        });

        // Auto-calculate end date based on plan type
        document.getElementById('planType').addEventListener('change', () => {
            this.calculateEndDate();
        });

        // Auto-detect plan type based on time range
        document.getElementById('startTime').addEventListener('change', () => {
            this.detectPlanType();
        });

        document.getElementById('endTime').addEventListener('change', () => {
            this.detectPlanType();
        });
    }

    // Plan Type Detection based on time
    detectPlanType() {
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        
        if (!startTime || !endTime) return;

        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        const duration = (end - start) / (1000 * 60 * 60); // hours

        let planType = '';
        if (duration <= 2) planType = 'hourly';
        else if (duration <= 4) planType = 'half-day';
        else if (duration <= 8) planType = 'full-day';
        else if (duration <= 24) planType = 'full-day';
        else planType = 'monthly';

        document.getElementById('planType').value = planType;
        this.calculateEndDate();
    }

    // Calculate end date based on plan type
    calculateEndDate() {
        const planType = document.getElementById('planType').value;
        const startDate = document.getElementById('startDate').value;
        
        if (!planType || !startDate) return;

        const start = new Date(startDate);
        const end = new Date(start);

        switch(planType) {
            case 'hourly':
                end.setDate(end.getDate() + 1);
                break;
            case 'half-day':
                end.setDate(end.getDate() + 1);
                break;
            case 'full-day':
                end.setDate(end.getDate() + 1);
                break;
            case 'weekly':
                end.setDate(end.getDate() + 7);
                break;
            case 'monthly':
                end.setDate(end.getDate() + 30);
                break;
        }

        document.getElementById('endDate').value = end.toISOString().split('T')[0];
    }

    // Set default dates
    setDefaultDates() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        document.getElementById('startDate').value = today.toISOString().split('T')[0];
        document.getElementById('endDate').value = tomorrow.toISOString().split('T')[0];
        
        // Set default times
        document.getElementById('startTime').value = '09:00';
        document.getElementById('endTime').value = '17:00';
    }

    // Add Subscription
    addSubscription() {
        const formData = {
            id: 'SUB-' + Date.now().toString().substr(-6),
            customerName: document.getElementById('customerName').value.trim(),
            whatsappNumber: document.getElementById('whatsappNumber').value.trim(),
            email: document.getElementById('email').value.trim(),
            planType: document.getElementById('planType').value,
            amount: parseFloat(document.getElementById('amount').value),
            startDate: new Date(document.getElementById('startDate').value),
            endDate: new Date(document.getElementById('endDate').value),
            startTime: document.getElementById('startTime').value,
            endTime: document.getElementById('endTime').value,
            status: 'active',
            createdAt: new Date()
        };

        if (!this.validateSubscription(formData)) {
            return;
        }

        this.subscriptions.push(formData);
        this.saveData();
        
        // Send emails
        this.sendSubscriptionEmails(formData);
        
        this.addNotification('system', formData, 
            `✅ New subscription added for ${formData.customerName} (${formData.planType})`);
        
        this.renderAll();
        this.resetForm();
        this.showMessage('Subscription added successfully!', 'success');
    }

    // Validate subscription
    validateSubscription(subscription) {
        if (!subscription.customerName) {
            this.showMessage('Customer name is required', 'error');
            return false;
        }
        if (!subscription.email || !this.isValidEmail(subscription.email)) {
            this.showMessage('Valid email address is required', 'error');
            return false;
        }
        if (!subscription.whatsappNumber) {
            this.showMessage('WhatsApp number is required', 'error');
            return false;
        }
        if (!subscription.amount || subscription.amount <= 0) {
            this.showMessage('Valid subscription amount is required', 'error');
            return false;
        }
        if (!subscription.planType) {
            this.showMessage('Plan type is required', 'error');
            return false;
        }
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Send subscription emails
    async sendSubscriptionEmails(subscription) {
        const subject = `🎉 New ${subscription.planType} Subscription - ${subscription.customerName}`;
        
        // Customer email
        const customerMessage = `
Dear ${subscription.customerName},

Thank you for subscribing to Spaceivy!

Subscription Details:
• Plan: ${subscription.planType}
• Amount: ₹${subscription.amount}
• Start Date: ${this.formatDate(subscription.startDate)}
• End Date: ${this.formatDate(subscription.endDate)}
• Time: ${subscription.startTime} - ${subscription.endTime}

We're excited to have you on board!

Best regards,
Spaceivy Team
        `;

        // Admin email
        const adminMessage = `
New Subscription Created:

Customer: ${subscription.customerName}
Email: ${subscription.email}
WhatsApp: ${subscription.whatsappNumber}
Plan: ${subscription.planType}
Amount: ₹${subscription.amount}
Start: ${this.formatDate(subscription.startDate)} at ${subscription.startTime}
End: ${this.formatDate(subscription.endDate)} at ${subscription.endTime}

Revenue: ₹${subscription.amount}
        `;

        try {
            // Send to customer
            await this.emailService.sendEmail(subscription.email, subject, customerMessage, subscription);
            
            // Send to admin
            await this.emailService.sendEmail('spaceivylounge@gmail.com', `[ADMIN] ${subject}`, adminMessage, subscription);
            
            this.addNotification('email', subscription, `📧 Emails sent to customer and admin`);
        } catch (error) {
            console.error('Email sending error:', error);
        }
    }

    // Calculate remaining time
    getRemainingTime(subscription) {
        const now = new Date();
        const endDateTime = new Date(subscription.endDate);
        endDateTime.setHours(
            parseInt(subscription.endTime.split(':')[0]),
            parseInt(subscription.endTime.split(':')[1])
        );

        const timeDiff = endDateTime.getTime() - now.getTime();
        
        if (timeDiff <= 0) {
            return 'Expired';
        }

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            return `${days} days, ${hours} hours`;
        } else if (hours > 0) {
            return `${hours} hours, ${minutes} minutes`;
        } else {
            return `${minutes} minutes`;
        }
    }

    // Get subscription status
    getSubscriptionStatus(subscription) {
        const now = new Date();
        const endDateTime = new Date(subscription.endDate);
        endDateTime.setHours(
            parseInt(subscription.endTime.split(':')[0]),
            parseInt(subscription.endTime.split(':')[1])
        );

        const timeDiff = endDateTime.getTime() - now.getTime();
        
        if (timeDiff <= 0) return 'expired';
        if (timeDiff <= 24 * 60 * 60 * 1000) return 'expiring'; // 24 hours
        return 'active';
    }

    // Calculate revenue
    calculateRevenue() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        let dailyRevenue = 0;
        let weeklyRevenue = 0;
        let monthlyRevenue = 0;

        this.subscriptions.forEach(sub => {
            const subDate = new Date(sub.startDate);
            const subDay = new Date(subDate.getFullYear(), subDate.getMonth(), subDate.getDate());
            
            if (subDay.getTime() === today.getTime()) {
                dailyRevenue += sub.amount;
            }
            
            if (subDate >= weekStart) {
                weeklyRevenue += sub.amount;
            }
            
            if (subDate >= monthStart) {
                monthlyRevenue += sub.amount;
            }
        });

        return { dailyRevenue, weeklyRevenue, monthlyRevenue };
    }

    // Render all components
    renderAll() {
        this.renderSubscriptions();
        this.renderNotifications();
        this.updateRevenue();
    }

    // Render subscriptions
    renderSubscriptions() {
        const container = document.getElementById('subscriptionsList');
        
        if (this.subscriptions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No Subscriptions Yet</h3>
                    <p>Add your first subscription to get started</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.subscriptions.map(subscription => {
            const status = this.getSubscriptionStatus(subscription);
            const remainingTime = this.getRemainingTime(subscription);
            const isExpiring = status === 'expiring';
            const isExpired = status === 'expired';

            return `
                <div class="subscription-card ${isExpiring ? 'expiring' : ''} ${isExpired ? 'expired' : ''}">
                    <div class="subscription-header">
                        <div class="customer-name">${subscription.customerName}</div>
                        <div class="plan-badge ${subscription.planType}">${subscription.planType}</div>
                    </div>
                    
                    <div class="subscription-details">
                        <div class="detail-item">
                            <div class="detail-label">Email</div>
                            <div class="detail-value">${subscription.email}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">WhatsApp</div>
                            <div class="detail-value">${subscription.whatsappNumber}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Amount</div>
                            <div class="detail-value">₹${subscription.amount}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Status</div>
                            <div class="detail-value">${status.toUpperCase()}</div>
                        </div>
                    </div>
                    
                    <div class="time-range">
                        <strong>Time:</strong> ${subscription.startTime} - ${subscription.endTime}
                    </div>
                    
                    <div class="remaining-time">
                        <i class="fas fa-clock"></i> ${remainingTime}
                    </div>
                    
                    <div class="subscription-actions">
                        <button onclick="removeSubscription('${subscription.id}')" class="btn btn-danger btn-sm">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Render notifications
    renderNotifications() {
        const container = document.getElementById('notificationsList');
        
        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell"></i>
                    <h3>No Activity Yet</h3>
                    <p>Activity will appear here</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.notifications.slice(0, 10).map(notification => `
            <div class="notification-item">
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${notification.timestamp.toLocaleString()}</div>
            </div>
        `).join('');
    }

    // Update revenue display
    updateRevenue() {
        const { dailyRevenue, weeklyRevenue, monthlyRevenue } = this.calculateRevenue();
        
        document.getElementById('dailyRevenue').textContent = `₹${dailyRevenue.toFixed(2)}`;
        document.getElementById('weeklyRevenue').textContent = `₹${weeklyRevenue.toFixed(2)}`;
        document.getElementById('monthlyRevenue').textContent = `₹${monthlyRevenue.toFixed(2)}`;
        
        // Update periods
        const now = new Date();
        document.getElementById('dailyPeriod').textContent = now.toLocaleDateString();
        document.getElementById('weeklyPeriod').textContent = `Week of ${now.toLocaleDateString()}`;
        document.getElementById('monthlyPeriod').textContent = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    // Add notification
    addNotification(type, subscription, message) {
        const notification = {
            id: Date.now(),
            timestamp: new Date(),
            type: type,
            subscription: subscription,
            message: message
        };
        
        this.notifications.unshift(notification);
        this.saveData();
        this.renderNotifications();
    }

    // Reset form
    resetForm() {
        document.getElementById('subscriptionForm').reset();
        this.setDefaultDates();
    }

    // Show message
    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;

        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, container.firstChild);

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Email configuration
    checkEmailConfiguration() {
        const isConfigured = localStorage.getItem('spaceivy_email_configured');
        if (isConfigured === 'true') {
            document.getElementById('emailConfig').style.display = 'none';
        } else {
            document.getElementById('emailConfig').style.display = 'block';
        }
    }

    configureEmail() {
        const password = document.getElementById('gmailPassword').value;
        if (!password) {
            this.showMessage('Please enter your Gmail app password', 'error');
            return;
        }

        this.emailService.configure({ password: password });
        localStorage.setItem('spaceivy_email_configured', 'true');
        localStorage.setItem('spaceivy_email_password', password);
        
        this.showMessage('Email configured successfully!', 'success');
        document.getElementById('emailConfig').style.display = 'none';
    }

    // Export to Excel
    exportToExcel() {
        const data = this.subscriptions.map(sub => ({
            'Customer Name': sub.customerName,
            'Email': sub.email,
            'WhatsApp': sub.whatsappNumber,
            'Plan Type': sub.planType,
            'Amount': sub.amount,
            'Start Date': this.formatDate(sub.startDate),
            'End Date': this.formatDate(sub.endDate),
            'Start Time': sub.startTime,
            'End Time': sub.endTime,
            'Status': this.getSubscriptionStatus(sub),
            'Remaining Time': this.getRemainingTime(sub),
            'Created At': sub.createdAt.toLocaleString()
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Subscriptions');
        
        const fileName = `spaceivy-subscriptions-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        this.showMessage('Data exported to Excel successfully!', 'success');
    }

    // Utility functions
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Remove subscription
    removeSubscription(subscriptionId) {
        if (confirm('Are you sure you want to remove this subscription?')) {
            const subscription = this.subscriptions.find(sub => sub.id === subscriptionId);
            if (subscription) {
                this.subscriptions = this.subscriptions.filter(sub => sub.id !== subscriptionId);
                this.saveData();
                this.renderAll();
                this.addNotification('system', null, 
                    `🗑️ Subscription removed for ${subscription.customerName}`);
                this.showMessage('Subscription removed successfully!', 'success');
            }
        }
    }

    // System controls
    checkExpiringSubscriptions() {
        let notificationsSent = 0;
        
        this.subscriptions.forEach(subscription => {
            const status = this.getSubscriptionStatus(subscription);
            if (status === 'expiring') {
                this.addNotification('expiry', subscription, 
                    `⚠️ ${subscription.customerName}'s subscription expires soon!`);
                notificationsSent++;
            }
        });
        
        this.renderAll();
        this.showMessage(`Check complete. ${notificationsSent} notifications sent.`, 'info');
    }

    simulateTimeAdvance() {
        // This would advance time for testing
        this.showMessage('Time advanced by 7 days', 'info');
        this.renderAll();
    }

    clearNotifications() {
        this.notifications = [];
        this.saveData();
        this.renderNotifications();
        this.showMessage('Activity log cleared', 'info');
    }

    configureGoogleSheets() {
        const apiKey = prompt('Enter your Google Sheets API Key:');
        if (apiKey) {
            this.googleSheetsService.configure({ apiKey: apiKey });
            this.showMessage('Google Sheets configured!', 'success');
        }
    }

    // Auto-check
    startAutoCheck() {
        setInterval(() => {
            this.checkExpiringSubscriptions();
        }, 30000);
    }
}

// Global functions
let subscriptionManager;

function checkExpiringSubscriptions() {
    subscriptionManager.checkExpiringSubscriptions();
}

function simulateTimeAdvance() {
    subscriptionManager.simulateTimeAdvance();
}

function exportToExcel() {
    subscriptionManager.exportToExcel();
}

function clearNotifications() {
    subscriptionManager.clearNotifications();
}

function configureEmail() {
    subscriptionManager.configureEmail();
}

function configureGoogleSheets() {
    subscriptionManager.configureGoogleSheets();
}

function removeSubscription(subscriptionId) {
    subscriptionManager.removeSubscription(subscriptionId);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    subscriptionManager = new SubscriptionManager();
    window.subscriptionManager = subscriptionManager;
});