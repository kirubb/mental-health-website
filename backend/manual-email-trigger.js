import mongoose from 'mongoose';
import 'dotenv/config';
import { sendDailyReminders } from './jobs/reminderService.js';
import connectDB from './config/mongodb.js';

const runManualCheck = async () => {
    try {
        await connectDB();
        console.log("Connected directly to DB for manual check.");

        console.log("Triggering daily reminder sending logic...");
        await sendDailyReminders();

        console.log("Manual check completed.");

        // Give time for any pending emails to send before closing connection
        setTimeout(() => {
            mongoose.disconnect();
            process.exit(0);
        }, 5000);

    } catch (err) {
        console.error("Error during manual check:", err);
        process.exit(1);
    }
};

runManualCheck();
