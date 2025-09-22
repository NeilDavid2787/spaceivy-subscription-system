/**
 * Spaceivy Subscription Billing System
 * A complete subscription management application with automated notifications
 */

class SubscriptionManager {
    constructor() {
        this.subscriptions = [];
        this.notifications = [];
        this.currentDate = new Date();
        this.emailService = new EmailService();
        this.whatsappService = new WhatsAppService();
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setDefaultDate();
        this.renderAll();
        this.startAutoCheck();
        this.loadSampleData();
        this.setupEmailConfiguration();
    }

    // Data Management
    loadData() {
        const savedSubscriptions = localStorage.getItem('spaceivy_subscriptions');
        const savedNotifications = localStorage.getItem('spaceivy_notifications');
        const savedDate = localStorage.getItem('spaceivy_current_date');

        if (savedSubscriptions) {
            this.subscriptions = JSON.parse(savedSubscriptions).map(sub => ({
                ...sub,
                startDate: new Date(sub.startDate)
            }));
        }

        if (savedNotifications) {
            this.notifications = JSON.parse(savedNotifications).map(notif => ({
                ...notif,
                timestamp: new Date(notif.timestamp)
            }));
        }

        if (savedDate) {
            this.currentDate = new Date(savedDate);
        }
    }

    saveData() {
        localStorage.setItem('spaceivy_subscriptions', JSON.stringify(this.subscriptions));
        localStorage.setItem('spaceivy_notifications', JSON.stringify(this.notifications));
        localStorage.setItem('spaceivy_current_date', this.currentDate.toISOString());
    }

    // Event Listeners
    setupEventListeners() {
        document.getElementById('subscriptionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSubscription();
        });
    }

    setupEmailConfiguration() {
        const configureBtn = document.getElementById('configureEmailBtn');
        console.log('Looking for configureEmailBtn:', configureBtn);
        if (configureBtn) {
            console.log('Button found, adding event listener...');
            configureBtn.addEventListener('click', () => {
                console.log('Button clicked!');
                this.configureEmail();
            });
            console.log('Event listener added successfully');
        } else {
            console.error('configureEmailBtn not found!');
        }
    }

    setDefaultDate() {
        document.getElementById('startDate').valueAsDate = this.currentDate;
    }

    // Subscription Management
    addSubscription() {
        const formData = new FormData(document.getElementById('subscriptionForm'));
        
        const subscription = {
            id: 'SUB-' + Date.now().toString().substr(-6),
            customerName: document.getElementById('customerName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            startDate: new Date(document.getElementById('startDate').value),
            duration: parseInt(document.getElementById('duration').value),
            amount: parseFloat(document.getElementById('amount').value),
            planType: document.getElementById('planType').value,
            status: 'active',
            createdAt: new Date()
        };

        // Validation
        if (!this.validateSubscription(subscription)) {
            return;
        }

        this.subscriptions.push(subscription);
        this.saveData();
        
        this.addNotification('system', subscription, 
            `✅ New subscription added for ${subscription.customerName} (${subscription.planType} plan)`);
        
        this.renderAll();
        this.resetForm();
        this.showMessage('Subscription added successfully!', 'success');
    }

    validateSubscription(subscription) {
        if (!subscription.customerName) {
            this.showMessage('Customer name is required', 'error');
            return false;
        }
        if (!subscription.email || !this.isValidEmail(subscription.email)) {
            this.showMessage('Valid email address is required', 'error');
            return false;
        }
        if (!subscription.phone) {
            this.showMessage('Phone number is required', 'error');
            return false;
        }
        if (!subscription.amount || subscription.amount <= 0) {
            this.showMessage('Valid subscription amount is required', 'error');
            return false;
        }
        if (!subscription.duration) {
            this.showMessage('Subscription duration is required', 'error');
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

    resetForm() {
        document.getElementById('subscriptionForm').reset();
        document.getElementById('startDate').valueAsDate = this.currentDate;
    }

    // Date Calculations
    calculateEndDate(startDate, duration) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + parseInt(duration));
        return endDate;
    }

    getDaysUntilExpiry(startDate, duration) {
        const endDate = this.calculateEndDate(startDate, duration);
        const timeDiff = endDate.getTime() - this.currentDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    getSubscriptionStatus(startDate, duration) {
        const daysUntilExpiry = this.getDaysUntilExpiry(startDate, duration);
        if (daysUntilExpiry < 0) return 'expired';
        if (daysUntilExpiry <= 7) return 'expiring';
        return 'active';
    }

    // Notifications
    addNotification(type, subscription, message) {
        const notification = {
            id: Date.now(),
            timestamp: new Date(this.currentDate),
            type: type,
            subscription: subscription,
            message: message
        };
        
        this.notifications.unshift(notification);
        this.saveData();
        this.renderNotifications();
    }

    async sendNotification(subscription, daysUntilExpiry) {
        // Generate email content
        const emailContent = this.emailService.generateEmailContent(subscription, daysUntilExpiry);
        const whatsappContent = this.whatsappService.generateWhatsAppContent(subscription, daysUntilExpiry);
        
        // Send real email
        const emailSent = await this.emailService.sendEmail(
            subscription.email, 
            emailContent.subject, 
            emailContent.message, 
            subscription
        );
        
        // Send real WhatsApp message
        const whatsappSent = await this.whatsappService.sendWhatsApp(
            subscription.phone, 
            whatsappContent
        );
        
        // Log notifications
        const emailMessage = `📧 EMAIL to ${subscription.email}: ${emailContent.subject}`;
        const whatsappMessage = `📱 WHATSAPP to ${subscription.phone}: Subscription expires in ${daysUntilExpiry} days`;
        
        this.addNotification('email', subscription, emailMessage);
        this.addNotification('whatsapp', subscription, whatsappMessage);
        
        return { emailSent, whatsappSent };
    }

    checkExpiringSubscriptions() {
        let notificationsSent = 0;
        
        this.subscriptions.forEach(subscription => {
            const daysUntilExpiry = this.getDaysUntilExpiry(subscription.startDate, subscription.duration);
            
            // Send notifications 7, 3, and 1 days before expiry
            if (daysUntilExpiry === 7 || daysUntilExpiry === 3 || daysUntilExpiry === 1) {
                this.sendNotification(subscription, daysUntilExpiry);
                notificationsSent++;
            }
            
            // Send expiry notification
            if (daysUntilExpiry === 0) {
                const expiredMessage = `⚠️ EXPIRED: ${subscription.customerName}'s ${subscription.planType} subscription has expired today. Amount due: ₹${subscription.amount}`;
                this.addNotification('expiry', subscription, expiredMessage);
                notificationsSent++;
            }
        });
        
        if (notificationsSent === 0) {
            this.addNotification('system', null, '✅ System check complete. No notifications needed at this time.');
        }
        
        this.renderAll();
        this.showMessage(`Check complete. ${notificationsSent} notifications sent.`, 'info');
    }

    simulateTimeAdvance() {
        this.currentDate.setDate(this.currentDate.getDate() + 7);
        this.saveData();
        
        this.addNotification('system', null, 
            `⏰ Time advanced by 7 days. Current date: ${this.formatDate(this.currentDate)}`);
        
        this.checkExpiringSubscriptions();
        this.renderAll();
        this.showMessage('Time advanced by 7 days', 'info');
    }

    clearNotifications() {
        this.notifications = [];
        this.saveData();
        this.renderNotifications();
        this.showMessage('Notifications cleared', 'info');
    }

    // Rendering
    renderAll() {
        this.renderSubscriptions();
        this.renderNotifications();
        this.updateStatistics();
    }

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
            const endDate = this.calculateEndDate(subscription.startDate, subscription.duration);
            const daysUntilExpiry = this.getDaysUntilExpiry(subscription.startDate, subscription.duration);
            const status = this.getSubscriptionStatus(subscription.startDate, subscription.duration);
            const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
            const isExpired = daysUntilExpiry < 0;

            return `
                <div class="subscription-card ${isExpiringSoon ? 'expiring-soon' : ''} ${isExpired ? 'expired' : ''}">
                    <div class="subscription-info">
                        <div class="info-item">
                            <div class="info-label">Customer</div>
                            <div class="info-value">${subscription.customerName}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Email</div>
                            <div class="info-value">${subscription.email}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Phone</div>
                            <div class="info-value">${subscription.phone}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Plan Type</div>
                            <div class="info-value">${subscription.planType}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Start Date</div>
                            <div class="info-value">${this.formatDate(subscription.startDate)}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">End Date</div>
                            <div class="info-value">${this.formatDate(endDate)}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Amount</div>
                            <div class="info-value">₹${subscription.amount}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Days Remaining</div>
                            <div class="info-value">${daysUntilExpiry > 0 ? daysUntilExpiry : 'Expired'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Status</div>
                            <div class="info-value">
                                <span class="status ${status}">${status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderNotifications() {
        const container = document.getElementById('notificationsList');
        
        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell"></i>
                    <h3>No Notifications Yet</h3>
                    <p>Notifications will appear here when subscriptions are expiring</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.type}">
                <div class="notification-message">${notification.message}</div>
                <div class="timestamp">${notification.timestamp.toLocaleString()}</div>
            </div>
        `).join('');
    }

    updateStatistics() {
        const totalSubscriptions = this.subscriptions.length;
        const expiringSoon = this.subscriptions.filter(sub => {
            const daysUntilExpiry = this.getDaysUntilExpiry(sub.startDate, sub.duration);
            return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
        }).length;
        
        const monthlyRevenue = this.subscriptions.reduce((total, sub) => {
            const daysUntilExpiry = this.getDaysUntilExpiry(sub.startDate, sub.duration);
            return daysUntilExpiry >= 0 ? total + sub.amount : total;
        }, 0);
        
        const notificationsSent = this.notifications.length;

        document.getElementById('totalSubscriptions').textContent = totalSubscriptions;
        document.getElementById('expiringSoon').textContent = expiringSoon;
        document.getElementById('monthlyRevenue').textContent = `₹${monthlyRevenue.toFixed(2)}`;
        document.getElementById('notificationsSent').textContent = notificationsSent;
    }

    // Utility Functions
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;

        // Insert at the top of main content
        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(messageDiv, mainContent.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Sample Data
    loadSampleData() {
        if (this.subscriptions.length === 0) {
            const sampleSubscriptions = [
                {
                    id: 'SUB-001',
                    customerName: 'Rajesh Kumar',
                    email: 'rajesh@example.com',
                    phone: '+91 98765 43210',
                    startDate: new Date(this.currentDate.getTime() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
                    duration: 30,
                    amount: 2999,
                    planType: 'premium',
                    status: 'active',
                    createdAt: new Date()
                },
                {
                    id: 'SUB-002',
                    customerName: 'Priya Sharma',
                    email: 'priya@example.com',
                    phone: '+91 87654 32109',
                    startDate: new Date(this.currentDate.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                    duration: 90,
                    amount: 7999,
                    planType: 'enterprise',
                    status: 'active',
                    createdAt: new Date()
                }
            ];

            this.subscriptions.push(...sampleSubscriptions);
            this.saveData();
            this.renderAll();
        }
    }

    // Auto-check for expiring subscriptions
    startAutoCheck() {
        // Check every 30 seconds (in production, this would be a server-side cron job)
        setInterval(() => {
            this.checkExpiringSubscriptions();
        }, 30000);
    }

    // Export functionality
    exportData() {
        const data = {
            subscriptions: this.subscriptions,
            notifications: this.notifications,
            exportDate: new Date().toISOString(),
            currentDate: this.currentDate.toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `spaceivy-subscriptions-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showMessage('Data exported successfully!', 'success');
    }

    // Email configuration
    configureEmail() {
        alert('Button click is working!'); // Test if click works
        console.log('Configure email function called');
        const password = document.getElementById('gmailPassword').value;
        console.log('Password length:', password.length);
        
        if (!password) {
            alert('Please enter your Gmail app password');
            return;
        }
        
        try {
            console.log('About to configure email service...');
            this.emailService.configure({ password: password });
            console.log('Email service configured, isConfigured:', this.emailService.isConfigured);
            
            console.log('Showing success message...');
            this.showMessage('Email service configured successfully!', 'success');
            
            console.log('Hiding configuration section...');
            const configSection = document.querySelector('.config-section');
            console.log('Config section found:', configSection);
            if (configSection) {
                configSection.style.display = 'none';
                console.log('Configuration section hidden');
            } else {
                console.error('Configuration section not found!');
            }
            
            console.log('Email configuration successful');
        } catch (error) {
            console.error('Email configuration error:', error);
            alert('Error configuring email: ' + error.message);
        }
    }
}

// Global functions for button clicks
let subscriptionManager;

function checkExpiringSubscriptions() {
    subscriptionManager.checkExpiringSubscriptions();
}

function simulateTimeAdvance() {
    subscriptionManager.simulateTimeAdvance();
}

function clearNotifications() {
    subscriptionManager.clearNotifications();
}

function exportData() {
    subscriptionManager.exportData();
}

// Make configureEmail globally accessible
function configureEmail() {
    if (window.subscriptionManager) {
        window.subscriptionManager.configureEmail();
    } else {
        alert('Subscription manager not loaded yet. Please wait and try again.');
    }
}

// Make it globally accessible
window.configureEmail = configureEmail;

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    subscriptionManager = new SubscriptionManager();
    window.subscriptionManager = subscriptionManager; // Make it globally accessible
});
