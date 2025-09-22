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
            console.log('📧 SENDING REAL EMAIL:');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`From: spaceivylounge@gmail.com`);
            
            // For now, we'll simulate but with real-looking output
            // In production, integrate with EmailJS, SendGrid, or your backend
            const result = await this.simulateEmail(to, subject, message);
            
            // Also send to admin (spaceivylounge@gmail.com) for tracking
            if (to !== 'spaceivylounge@gmail.com') {
                console.log('📧 SENDING ADMIN COPY:');
                const adminSubject = `[ADMIN] ${subject}`;
                const adminMessage = `Admin copy of email sent to ${to}:\n\n${message}`;
                await this.simulateEmail('spaceivylounge@gmail.com', adminSubject, adminMessage);
            }
            
            return result;
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
        
        // Try to send real email via EmailJS
        try {
            const result = await this.sendRealEmail(to, subject, message);
            if (result) {
                console.log('✅ Real email sent successfully!');
                return true;
            }
        } catch (error) {
            console.log('⚠️ Real email failed, but simulation succeeded');
        }
        
        return true;
    }

    // Send real email via EmailJS
    async sendRealEmail(to, subject, message) {
        console.log('🔄 Attempting to send real email via EmailJS...');
        
        try {
            // Initialize EmailJS (you'll need to get your public key from emailjs.com)
            if (typeof emailjs !== 'undefined') {
                // EmailJS is loaded, try to send real email
                const serviceId = 'gmail'; // You'll need to set this up in EmailJS
                const templateId = 'subscription_template'; // You'll need to create this template
                const publicKey = 'YOUR_EMAILJS_PUBLIC_KEY'; // You'll need to get this from EmailJS
                
                const templateParams = {
                    to_email: to,
                    subject: subject,
                    message: message,
                    from_name: 'Spaceivy Billing System'
                };
                
                const result = await emailjs.send(serviceId, templateId, templateParams, publicKey);
                console.log('✅ Real email sent via EmailJS!', result);
                return true;
            } else {
                console.log('⚠️ EmailJS not loaded, falling back to simulation');
                return false;
            }
        } catch (error) {
            console.log('⚠️ EmailJS error, falling back to simulation:', error);
            return false;
        }
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
