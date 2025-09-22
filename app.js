/**
 * Simple Spaceivy CRM
 * Concise subscription management
 */

class SimpleCRM {
    constructor() {
        this.subscriptions = [];
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setDefaultDates();
        this.render();
    }

    // Data Management
    loadData() {
        const saved = localStorage.getItem('spaceivy_subscriptions');
        if (saved) {
            this.subscriptions = JSON.parse(saved).map(sub => ({
                ...sub,
                startDate: new Date(sub.startDate)
            }));
        }
    }

    saveData() {
        localStorage.setItem('spaceivy_subscriptions', JSON.stringify(this.subscriptions));
    }

    // Event Listeners
    setupEventListeners() {
        // Form submission
        document.getElementById('addForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSubscription();
        });

        // Plan type detection
        document.getElementById('startTime').addEventListener('change', () => {
            this.detectPlanType();
        });

        document.getElementById('endTime').addEventListener('change', () => {
            this.detectPlanType();
        });
    }

    // Plan Type Detection
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
    }

    // Set default dates
    setDefaultDates() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        document.getElementById('startDate').value = today.toISOString().split('T')[0];
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
        this.sendEmails(formData);
        
        this.showNotification('Subscription added successfully!', 'success');
        this.hideForm();
        this.render();
    }

    // Validate subscription
    validateSubscription(subscription) {
        if (!subscription.customerName) {
            this.showNotification('Customer name is required', 'error');
            return false;
        }
        if (!subscription.email || !this.isValidEmail(subscription.email)) {
            this.showNotification('Valid email address is required', 'error');
            return false;
        }
        if (!subscription.whatsappNumber) {
            this.showNotification('WhatsApp number is required', 'error');
            return false;
        }
        if (!subscription.amount || subscription.amount <= 0) {
            this.showNotification('Valid subscription amount is required', 'error');
            return false;
        }
        if (!subscription.planType) {
            this.showNotification('Plan type is required', 'error');
            return false;
        }
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Send emails
    async sendEmails(subscription) {
        const subject = `🎉 New ${subscription.planType} Subscription - ${subscription.customerName}`;
        
        // Customer email
        const customerMessage = `
Dear ${subscription.customerName},

Thank you for subscribing to Spaceivy!

Subscription Details:
• Plan: ${subscription.planType}
• Amount: ₹${subscription.amount}
• Start Date: ${this.formatDate(subscription.startDate)}
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
End: ${subscription.endTime}

Revenue: ₹${subscription.amount}
        `;

        try {
            // Simulate email sending
            console.log('📧 Customer Email:', customerMessage);
            console.log('📧 Admin Email:', adminMessage);
            
            this.showNotification('Emails logged to console - check browser console', 'info');
        } catch (error) {
            console.error('Email error:', error);
            this.showNotification('Email simulation failed', 'error');
        }
    }

    // Get subscription status
    getSubscriptionStatus(subscription) {
        const now = new Date();
        const startDate = new Date(subscription.startDate);
        const daysDiff = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff < 0) return 'pending';
        if (daysDiff > 30) return 'expired';
        if (daysDiff > 25) return 'expiring';
        return 'active';
    }

    // Calculate revenue
    calculateRevenue() {
        return this.subscriptions.reduce((total, sub) => total + sub.amount, 0);
    }

    // Render everything
    render() {
        this.renderStats();
        this.renderTable();
    }

    // Render stats
    renderStats() {
        const totalRevenue = this.calculateRevenue();
        const activeSubscriptions = this.subscriptions.filter(sub => 
            this.getSubscriptionStatus(sub) === 'active'
        ).length;
        const expiringSoon = this.subscriptions.filter(sub => 
            this.getSubscriptionStatus(sub) === 'expiring'
        ).length;

        document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;
        document.getElementById('activeSubscriptions').textContent = activeSubscriptions;
        document.getElementById('expiringSoon').textContent = expiringSoon;
    }

    // Render table
    renderTable() {
        const tbody = document.getElementById('subscriptionsTable');
        
        if (this.subscriptions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-users"></i>
                        <p>No subscriptions yet. Click "Add Subscription" to get started.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.subscriptions.map(subscription => {
            const status = this.getSubscriptionStatus(subscription);
            
            return `
                <tr>
                    <td>
                        <div style="font-weight: 500;">${subscription.customerName}</div>
                        <div style="font-size: 12px; color: #718096;">${subscription.email}</div>
                    </td>
                    <td>
                        <span class="status-badge ${subscription.planType}">${subscription.planType}</span>
                    </td>
                    <td>₹${subscription.amount}</td>
                    <td>${this.formatDate(subscription.startDate)}</td>
                    <td>${subscription.startTime} - ${subscription.endTime}</td>
                    <td>
                        <span class="status-badge ${status}">${status}</span>
                    </td>
                    <td>
                        <button onclick="removeSubscription('${subscription.id}')" class="btn btn-danger btn-sm">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Remove subscription
    removeSubscription(id) {
        if (confirm('Are you sure you want to remove this subscription?')) {
            this.subscriptions = this.subscriptions.filter(sub => sub.id !== id);
            this.saveData();
            this.render();
            this.showNotification('Subscription removed', 'info');
        }
    }

    // Export data
    exportData() {
        const data = this.subscriptions.map(sub => ({
            'Customer Name': sub.customerName,
            'Email': sub.email,
            'WhatsApp': sub.whatsappNumber,
            'Plan Type': sub.planType,
            'Amount': sub.amount,
            'Start Date': this.formatDate(sub.startDate),
            'Start Time': sub.startTime,
            'End Time': sub.endTime,
            'Status': this.getSubscriptionStatus(sub)
        }));

        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spaceivy-subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!', 'success');
    }

    // Convert to CSV
    convertToCSV(data) {
        const headers = Object.keys(data[0] || {});
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');
        return csvContent;
    }

    // Clear all data
    clearData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            this.subscriptions = [];
            this.saveData();
            this.render();
            this.showNotification('All data cleared', 'info');
        }
    }

    // Show form
    showForm() {
        document.getElementById('subscriptionForm').style.display = 'block';
        document.getElementById('customerName').focus();
    }

    // Hide form
    hideForm() {
        document.getElementById('subscriptionForm').style.display = 'none';
        document.getElementById('addForm').reset();
        this.setDefaultDates();
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.getElementById('notifications').appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Utility functions
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Global functions
let crm;

function addSubscription() {
    crm.showForm();
}

function hideForm() {
    crm.hideForm();
}

function removeSubscription(id) {
    crm.removeSubscription(id);
}

function exportData() {
    crm.exportData();
}

function clearData() {
    crm.clearData();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    crm = new SimpleCRM();
    window.crm = crm;
});