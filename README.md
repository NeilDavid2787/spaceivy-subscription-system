# 🚀 Spaceivy Subscription Billing System

A complete subscription management application with automated notifications, built with vanilla HTML, CSS, and JavaScript.

## ✨ Features

- **Subscription Management**: Add, track, and manage customer subscriptions
- **Automated Notifications**: Email and SMS reminders for expiring subscriptions
- **Real-time Dashboard**: Visual statistics and subscription status tracking
- **Data Persistence**: Local storage for data retention
- **Time Simulation**: Demo mode with time advancement for testing
- **Export Functionality**: Export subscription data as JSON
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations

## 🚀 Quick Start

### Option 1: Simple File Opening
1. Open `index.html` in your web browser
2. Start managing subscriptions immediately!

### Option 2: Local Development Server
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```
   or
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:3000`

## 📋 Usage

### Adding Subscriptions
1. Fill out the subscription form with customer details
2. Select subscription duration and plan type
3. Click "Add Subscription" to save

### Managing Notifications
- **Check Expiring**: Manually check for subscriptions expiring soon
- **Advance Time**: Simulate time passing (useful for testing)
- **Clear Notifications**: Clear the notification log
- **Export Data**: Download subscription data as JSON

### Dashboard Statistics
- **Total Subscriptions**: Count of all active subscriptions
- **Expiring Soon**: Subscriptions expiring within 7 days
- **Monthly Revenue**: Total revenue from active subscriptions
- **Notifications Sent**: Total notifications sent

## 🔧 Configuration

### Notification Settings
The system automatically sends notifications:
- 7 days before expiry
- 3 days before expiry
- 1 day before expiry
- On expiry day

### Plan Types
- **Basic Plan**: Entry-level subscription
- **Premium Plan**: Enhanced features
- **Enterprise Plan**: Full-featured solution
- **Custom Plan**: Tailored to specific needs

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

## 💾 Data Storage

- All data is stored in browser's local storage
- Data persists between browser sessions
- Export functionality available for backup
- No server required for basic functionality

## 🎨 Customization

### Styling
- Modify `styles.css` to change colors, fonts, and layout
- CSS variables available for easy theme customization
- Responsive breakpoints can be adjusted

### Functionality
- Extend `app.js` to add new features
- Modify notification timing in the `checkExpiringSubscriptions()` method
- Add new plan types in the HTML form

## 🔮 Future Enhancements

- **Email Integration**: Real email sending via SMTP
- **SMS Integration**: Real SMS notifications via Twilio
- **Payment Processing**: Stripe/PayPal integration
- **User Authentication**: Login and user management
- **Database Integration**: PostgreSQL/MySQL support
- **API Endpoints**: RESTful API for external integrations
- **Advanced Analytics**: Revenue charts and reporting
- **Bulk Operations**: Import/export multiple subscriptions

## 🛠️ Technical Details

### Built With
- **HTML5**: Semantic markup and modern features
- **CSS3**: Flexbox, Grid, animations, and responsive design
- **Vanilla JavaScript**: ES6+ features, classes, and modules
- **Font Awesome**: Icons and visual elements
- **Local Storage**: Client-side data persistence

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🎯 Roadmap

- [ ] Real email/SMS integration
- [ ] Payment processing
- [ ] User authentication
- [ ] Database backend
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] API development
- [ ] Multi-tenant support

---

**Made with ❤️ by the Spaceivy Team**
