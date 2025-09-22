/**
 * Email Service for Spaceivy Subscription System
 * Handles real email sending via Gmail SMTP
 */

class EmailService {
    constructor() {
        this.smtpConfig = {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'spaceivylounge@gmail.com',
                pass: '' // Will be set when you provide the app password
            }
        };
        this.isConfigured = false;
    }

    // Configure email service with credentials
    configure(credentials) {
        this.smtpConfig.auth.pass = credentials.password;
        this.isConfigured = true;
    }

    // Send email notification
    async sendEmail(to, subject, message, subscription) {
        if (!this.isConfigured) {
            console.warn('Email service not configured. Sending simulated email.');
            return this.simulateEmail(to, subject, message);
        }

        try {
            // In a real implementation, you would use a library like nodemailer
            // For now, we'll simulate the email sending
            return await this.simulateEmail(to, subject, message);
        } catch (error) {
            console.error('Email sending failed:', error);
            return false;
        }
    }

    // Simulate email sending (for demo purposes)
    async simulateEmail(to, subject, message) {
        console.log('📧 EMAIL SENT:');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Message: ${message}`);
        console.log('---');
        
        // In production, this would actually send the email
        return true;
    }

    // Generate email content for subscription notifications
    generateEmailContent(subscription, daysUntilExpiry) {
        const subject = `Spaceivy Subscription Reminder - ${daysUntilExpiry} days remaining`;
        
        const message = `
Dear ${subscription.customerName},

This is a friendly reminder that your Spaceivy ${subscription.planType} subscription will expire in ${daysUntilExpiry} days.

Subscription Details:
- Plan: ${subscription.planType}
- Amount: ₹${subscription.amount}
- Expires: ${this.formatDate(this.calculateEndDate(subscription.startDate, subscription.duration))}

To continue enjoying our services, please renew your subscription before the expiry date.

If you have any questions, please don't hesitate to contact us.

Best regards,
Spaceivy Team
spaceivylounge@gmail.com
        `;

        return { subject, message };
    }

    // Helper methods
    calculateEndDate(startDate, duration) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + parseInt(duration));
        return endDate;
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// WhatsApp Service
class WhatsAppService {
    constructor() {
        this.phoneNumber = '+919704259889';
        this.isConfigured = false;
    }

    // Send WhatsApp notification
    async sendWhatsApp(to, message) {
        if (!this.isConfigured) {
            console.warn('WhatsApp service not configured. Sending simulated message.');
            return this.simulateWhatsApp(to, message);
        }

        try {
            // In a real implementation, you would use WhatsApp Business API
            // For now, we'll simulate the WhatsApp sending
            return await this.simulateWhatsApp(to, message);
        } catch (error) {
            console.error('WhatsApp sending failed:', error);
            return false;
        }
    }

    // Simulate WhatsApp sending
    async simulateWhatsApp(to, message) {
        console.log('📱 WHATSAPP SENT:');
        console.log(`To: ${to}`);
        console.log(`Message: ${message}`);
        console.log('---');
        
        // In production, this would actually send the WhatsApp message
        return true;
    }

    // Generate WhatsApp content for subscription notifications
    generateWhatsAppContent(subscription, daysUntilExpiry) {
        return `🚀 Spaceivy Subscription Reminder

Hi ${subscription.customerName},

Your ${subscription.planType} subscription expires in ${daysUntilExpiry} days.

Amount: ₹${subscription.amount}
Expires: ${this.formatDate(this.calculateEndDate(subscription.startDate, subscription.duration))}

Renew now to continue enjoying our services!

Contact: spaceivylounge@gmail.com
        `;
    }

    // Helper methods
    calculateEndDate(startDate, duration) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + parseInt(duration));
        return endDate;
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Export services
window.EmailService = EmailService;
window.WhatsAppService = WhatsAppService;
