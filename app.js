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

    // Parse time string to minutes (from your calculator)
    parseTimeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Calculate duration and billing plan (integrated from your calculator)
    calculateDurationAndBilling(startTime, endTime) {
        const startMinutes = this.parseTimeToMinutes(startTime);
        const endMinutes = this.parseTimeToMinutes(endTime);
        
        // Calculate duration in minutes
        const durationMinutes = endMinutes - startMinutes;
        const durationHours = Math.floor(durationMinutes / 60);
        const remainingMinutes = durationMinutes % 60;
        
        // Calculate billable hours (any partial hour counts as full hour)
        const billableHours = Math.ceil(durationMinutes / 60);
        
        // Calculate billing plan and amount using your exact logic
        let totalAmount, billingPlan, rateApplied;
        
        if (billableHours >= 10) {
            // Full Day: 10+ hours = ₹600 (flat rate)
            totalAmount = 600;
            billingPlan = "full-day";
            rateApplied = "₹600 (10+ hours)";
        } else if (billableHours >= 8) {
            // Work Day base (8 hours) + extra hours
            const extraHours = billableHours - 8;
            totalAmount = 500 + (extraHours * 75);
            billingPlan = "work-day";
            if (extraHours > 0) {
                rateApplied = `₹500 (8 hrs) + ₹${extraHours * 75} (${extraHours} extra hr${extraHours > 1 ? 's' : ''})`;
            } else {
                rateApplied = "₹500 (8 hours)";
            }
        } else if (billableHours >= 5) {
            // Half Day base (5 hours) + extra hours
            const extraHours = billableHours - 5;
            totalAmount = 300 + (extraHours * 75);
            billingPlan = "half-day";
            if (extraHours > 0) {
                rateApplied = `₹300 (5 hrs) + ₹${extraHours * 75} (${extraHours} extra hr${extraHours > 1 ? 's' : ''})`;
            } else {
                rateApplied = "₹300 (5 hours)";
            }
        } else {
            // Hourly: Less than 5 hours = ₹75 per hour
            totalAmount = billableHours * 75;
            billingPlan = "hourly";
            rateApplied = `₹75 × ${billableHours} hour${billableHours > 1 ? 's' : ''}`;
        }
        
        return {
            durationMinutes,
            durationHours,
            remainingMinutes,
            billableHours,
            totalAmount,
            billingPlan,
            rateApplied
        };
    }

    // Plan Type Detection (updated with your calculator logic)
    detectPlanType() {
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        
        if (!startTime || !endTime) return;

        const calculation = this.calculateDurationAndBilling(startTime, endTime);
        
        // Auto-fill the plan type and amount
        document.getElementById('planType').value = calculation.billingPlan;
        document.getElementById('amount').value = calculation.totalAmount;
    }

    // Calculate expiry date based on plan type and start date/time
    calculateExpiryDate(startDate, startTime, endTime, planType) {
        const startDateTime = new Date(`${startDate}T${startTime}`);
        
        switch (planType) {
            case 'hourly':
                // For hourly plans, expiry is at the end time of the same day
                return new Date(`${startDate}T${endTime}`);
                
            case 'half-day':
                // Half day: 5 hours from start time
                const halfDayExpiry = new Date(startDateTime);
                halfDayExpiry.setHours(halfDayExpiry.getHours() + 5);
                return halfDayExpiry;
                
            case 'work-day':
                // Work day: 8 hours from start time
                const workDayExpiry = new Date(startDateTime);
                workDayExpiry.setHours(workDayExpiry.getHours() + 8);
                return workDayExpiry;
                
            case 'full-day':
                // Full day: 10 hours or more from start time
                const fullDayExpiry = new Date(startDateTime);
                fullDayExpiry.setHours(fullDayExpiry.getHours() + 10);
                return fullDayExpiry;
                
            case 'weekly':
                // Weekly: 6 days from start date
                const weeklyExpiry = new Date(startDate);
                weeklyExpiry.setDate(weeklyExpiry.getDate() + 6);
                return weeklyExpiry;
                
            case 'monthly':
                // Monthly: 30 days from start date
                const monthlyExpiry = new Date(startDate);
                monthlyExpiry.setDate(monthlyExpiry.getDate() + 30);
                return monthlyExpiry;
                
            default:
                // Default to 30 days for unknown plan types
                const defaultExpiry = new Date(startDate);
                defaultExpiry.setDate(defaultExpiry.getDate() + 30);
                return defaultExpiry;
        }
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
        const startDate = document.getElementById('startDate').value;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const planType = document.getElementById('planType').value;
        const endDate = document.getElementById('endDate').value;
        const endTimeManual = document.getElementById('endTimeManual').value;
        
        // Calculate expiry date - use manual end date if provided, otherwise auto-calculate
        let expiryDate;
        if (endDate) {
            // Use manual end date
            if (endTimeManual) {
                expiryDate = new Date(`${endDate}T${endTimeManual}`);
            } else {
                expiryDate = new Date(`${endDate}T23:59:59`); // End of day if no time specified
            }
        } else {
            // Auto-calculate based on plan type
            expiryDate = this.calculateExpiryDate(startDate, startTime, endTime, planType);
        }
        
        const formData = {
            id: 'SUB-' + Date.now().toString().substr(-6),
            customerName: document.getElementById('customerName').value.trim(),
            whatsappNumber: document.getElementById('whatsappNumber').value.trim(),
            email: document.getElementById('email').value.trim(),
            planType: planType,
            amount: parseFloat(document.getElementById('amount').value),
            startDate: new Date(startDate),
            startTime: startTime,
            endTime: endTime,
            endDate: endDate || null, // Store manual end date if provided
            endTimeManual: endTimeManual || null, // Store manual end time if provided
            expiryDate: expiryDate,
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
        const expiryDate = subscription.expiryDate ? this.formatDate(new Date(subscription.expiryDate)) : 'N/A';
        const expiryTime = subscription.expiryDate ? new Date(subscription.expiryDate).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}) : '';
        const expiryType = (subscription.endDate || subscription.endTimeManual) ? 'Manually Set' : 'Auto-calculated';
        
        const customerMessage = `
Dear ${subscription.customerName},

Thank you for subscribing to Spaceivy!

Subscription Details:
• Plan: ${subscription.planType}
• Amount: ₹${subscription.amount}
• Start Date: ${this.formatDate(subscription.startDate)}
• Time: ${subscription.startTime} - ${subscription.endTime}
• Expiry Date: ${expiryDate} ${expiryTime}
• Expiry Type: ${expiryType}

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
Expiry: ${expiryDate} ${expiryTime} (${expiryType})
${subscription.endDate ? `Manual End Date: ${subscription.endDate}` : ''}
${subscription.endTimeManual ? `Manual End Time: ${subscription.endTimeManual}` : ''}

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
        
        // Check if subscription has started
        if (now < startDate) return 'pending';
        
        // Use calculated expiry date if available, otherwise fallback to old logic
        if (subscription.expiryDate) {
            const expiryDate = new Date(subscription.expiryDate);
            const timeUntilExpiry = expiryDate - now;
            const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);
            
            if (now > expiryDate) return 'expired';
            if (hoursUntilExpiry <= 24) return 'expiring'; // Less than 24 hours remaining
            return 'active';
        }
        
        // Fallback for old subscriptions without expiry date
        const daysDiff = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
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
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-users"></i>
                        <p>No subscriptions yet. Click "Add Subscription" to get started.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.subscriptions.map(subscription => {
            const status = this.getSubscriptionStatus(subscription);
            const expiryDate = subscription.expiryDate ? this.formatDate(new Date(subscription.expiryDate)) : 'N/A';
            
            // Format plan type display
            const planDisplay = subscription.planType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            // Check if expiry date was manually set
            const isManualExpiry = subscription.endDate || subscription.endTimeManual;
            
            return `
                <tr>
                    <td>
                        <div style="font-weight: 500;">${subscription.customerName}</div>
                        <div style="font-size: 12px; color: #718096;">${subscription.email}</div>
                    </td>
                    <td>
                        <span class="status-badge ${subscription.planType}">${planDisplay}</span>
                    </td>
                    <td>
                        <div style="font-weight: 600; color: #059669;">₹${subscription.amount}</div>
                        ${subscription.planType === 'hourly' || subscription.planType === 'half-day' || subscription.planType === 'work-day' ? 
                            `<div style="font-size: 11px; color: #666;">${subscription.startTime} - ${subscription.endTime}</div>` : ''}
                    </td>
                    <td>${this.formatDate(subscription.startDate)}</td>
                    <td>${subscription.startTime} - ${subscription.endTime}</td>
                    <td>
                        <div style="font-size: 13px;">${expiryDate}</div>
                        ${subscription.expiryDate ? 
                            `<div style="font-size: 11px; color: #666;">${new Date(subscription.expiryDate).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}</div>` : ''}
                        ${isManualExpiry ? 
                            `<div style="font-size: 10px; color: #059669; font-weight: 500;">📅 Manual</div>` : 
                            `<div style="font-size: 10px; color: #666;">⚡ Auto</div>`}
                    </td>
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
        const data = this.subscriptions.map(sub => {
            // Calculate billing details for export
            const calculation = this.calculateDurationAndBilling(sub.startTime, sub.endTime);
            
            return {
                'Customer Name': sub.customerName,
                'Email': sub.email,
                'WhatsApp': sub.whatsappNumber,
                'Plan Type': sub.planType,
                'Billable Hours': calculation.billableHours,
                'Rate Applied': calculation.rateApplied,
                'Amount': sub.amount,
                'Start Date': this.formatDate(sub.startDate),
                'Start Time': sub.startTime,
                'End Time': sub.endTime,
                'Manual End Date': sub.endDate || 'Auto-calculated',
                'Manual End Time': sub.endTimeManual || 'Auto-calculated',
                'Expiry Date': sub.expiryDate ? this.formatDate(new Date(sub.expiryDate)) : 'N/A',
                'Expiry Time': sub.expiryDate ? new Date(sub.expiryDate).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}) : 'N/A',
                'Expiry Type': (sub.endDate || sub.endTimeManual) ? 'Manual' : 'Auto-calculated',
                'Status': this.getSubscriptionStatus(sub)
            };
        });

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
        // Clear manual end date fields
        document.getElementById('endDate').value = '';
        document.getElementById('endTimeManual').value = '';
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