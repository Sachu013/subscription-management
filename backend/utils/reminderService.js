const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Subscription = require('../models/subscriptionModel');
const { getNextDueDate } = require('./subscriptionUtils');

const sendEmail = async (userEmail, subscriptionName, daysLeft, amount) => {
    // Check if email config exists
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email service not configured. Skipping email send.');
        return false;
    }

    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `Reminder: ${subscriptionName} Payment Due Soon!`,
        text: `Hello, your subscription for ${subscriptionName} is due in ${daysLeft} days. Renewal Amount: ₹${amount}.`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #43e97b;">Subscription Reminder</h2>
                <p>Hello,</p>
                <p>This is a reminder that your subscription for <strong>${subscriptionName}</strong> is due for renewal in <strong>${daysLeft} days</strong>.</p>
                <p style="font-size: 18px; font-weight: bold;">Amount: ₹${amount}</p>
                <p>Please ensure you have sufficient funds to avoid any service interruption.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #888;">This is an automated reminder from your Subscription Manager.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${userEmail} for ${subscriptionName}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

const startReminderCron = () => {
    // Runs daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
        console.log('Running daily subscription reminder audit...');
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Fetch active subscriptions with user info
            const subscriptions = await Subscription.find({ status: 'Active' }).populate('user', 'email username');

            for (const sub of subscriptions) {
                if (!sub.user || !sub.user.email) continue;

                const nextDue = new Date(getNextDueDate(sub));
                nextDue.setHours(0, 0, 0, 0);

                const reminderDays = sub.reminderDays || 3;
                const reminderDate = new Date(nextDue);
                reminderDate.setDate(reminderDate.getDate() - reminderDays);

                // Normalize dates for comparison
                const todayTime = today.getTime();
                const reminderTime = reminderDate.getTime();

                // Check if today matches the calculated reminder date
                const lastSent = sub.lastReminderSent ? new Date(sub.lastReminderSent) : null;
                const alreadySentToday = lastSent && lastSent.toDateString() === today.toDateString();

                if (todayTime === reminderTime && !alreadySentToday) {
                    const price = sub.price || sub.cost || 0;
                    const success = await sendEmail(sub.user.email, sub.name, reminderDays, price);
                    if (success) {
                        sub.lastReminderSent = today;
                        await sub.save();
                    }
                }
            }
        } catch (error) {
            console.error('Error in reminder cron job:', error);
        }
    });
};

module.exports = { startReminderCron };
