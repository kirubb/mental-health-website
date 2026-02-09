import cron from 'node-cron';
import appointmentModel from '../models/appointmentModel.js';
import transporter from '../config/emailConfig.js';

const sendDailyReminders = async () => {
    try {
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const todaySlotDate = `${day}_${month}_${year}`;

        console.log(`[Reminder Service] Checking for appointments on: ${todaySlotDate}`);

        const appointments = await appointmentModel.find({
            slotDate: todaySlotDate,
            cancelled: false,
            isCompleted: false
        });

        if (appointments.length === 0) {
            console.log('[Reminder Service] No appointments found for today.');
            return;
        }

        console.log(`[Reminder Service] Found ${appointments.length} appointments.`);

        for (const appointment of appointments) {
            const userEmail = appointment.userData.email;
            const userName = appointment.userData.name;
            const doctorName = appointment.docData.name;
            const time = appointment.slotTime;

            const mailOptions = {
                from: process.env.SMTP_USER,
                to: userEmail,
                subject: 'Appointment Reminder - Therapy Co.',
                text: `Hello ${userName},\n\nThi is a reminder for your appointment with Dr. ${doctorName} today at ${time}.\n\nPlease ensure you are available.\n\nBest regards,\nTherapy Co.`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                        <h2 style="color: #333;">Appointment Reminder</h2>
                        <p>Hello <strong>${userName}</strong>,</p>
                        <p>This is a reminder for your appointment with <strong>Dr. ${doctorName}</strong> today at <strong>${time}</strong>.</p>
                        <p>Please ensure you are available.</p>
                        <br/>
                        <p>Best regards,</p>
                        <p><strong>Therapy Co.</strong></p>
                    </div>
                `
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(`[Reminder Service] Error sending email to ${userEmail}:`, error);
                } else {
                    console.log(`[Reminder Service] Email sent to ${userEmail}: ` + info.response);
                }
            });
        }

    } catch (error) {
        console.error('[Reminder Service] Error in daily reminder job:', error);
    }
};

// Schedule the task to run every day at 8:00 AM
// Cron format: Minute Hour Day Month DayOfWeek
// 0 8 * * * means 8:00 AM daily
const startReminderService = () => {
    cron.schedule('0 8 * * *', () => {
        console.log('[Reminder Service] Running daily appointment check...');
        sendDailyReminders();
    });
    console.log('[Reminder Service] Daily reminder job scheduled for 8:00 AM.');
};

export { startReminderService, sendDailyReminders };
