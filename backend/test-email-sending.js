import mongoose from 'mongoose';
import 'dotenv/config';
import appointmentModel from './models/appointmentModel.js';
import userModel from './models/userModel.js';
import doctorModel from './models/doctorModel.js';
import { sendDailyReminders } from './jobs/reminderService.js';

const testSpecificEmail = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected");

        const targetEmail = "kiritbaruah@gmail.com";

        // 1. Create/Get User
        let user = await userModel.findOne({ email: targetEmail });
        if (!user) {
            console.log(`User ${targetEmail} not found, creating dummy user...`);
            user = new userModel({
                name: "Kirit Baruah",
                email: targetEmail,
                password: "hashedpassword123", // Dummy
                address: { line1: "Test St", line2: "Test Area" },
                gender: "Male",
                dob: "2000-01-01",
                phone: "1234567890"
            });
            await user.save();
        } else {
            console.log(`Found existing user: ${user.name}`);
        }

        // 2. Create/Get Doctor (Dummy)
        let doctor = await doctorModel.findOne({ email: "dummy_doc_test@example.com" });
        if (!doctor) {
            doctor = new doctorModel({
                name: "Dr. Test Bot",
                email: "dummy_doc_test@example.com",
                password: "password",
                image: "http://example.com/doc.png",
                speciality: "General",
                degree: "MBBS",
                experience: "10 Years",
                about: "I am a test doctor.",
                fees: 0,
                address: { line1: "Clinic", line2: "Town" },
                date: Date.now()
            });
            await doctor.save();
        }

        // 3. Create Appointment for TODAY
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const todaySlotDate = `${day}_${month}_${year}`;

        // Check if one already exists to avoid duplicate spam if run multiple times
        const existingAppt = await appointmentModel.findOne({
            userId: user._id,
            slotDate: todaySlotDate,
            cancelled: false
        });

        if (!existingAppt) {
            const appointment = new appointmentModel({
                userId: user._id,
                docId: doctor._id,
                slotDate: todaySlotDate,
                slotTime: "10:30 AM",
                userData: user, // Important: Schema usually expects this snapshot
                docData: doctor,
                amount: 0,
                date: Date.now(),
                cancelled: false,
                isCompleted: false,
                payment: true
            });
            await appointment.save();
            console.log(`Created test appointment for today (${todaySlotDate})`);
        } else {
            console.log("Appointment for today already exists, proceeding to send email...");
        }

        // 4. Trigger Email Logic
        console.log("Triggering reminder service...");
        await sendDailyReminders();

        console.log("Done. Check your inbox.");

    } catch (err) {
        console.error("Error in test script:", err);
    } finally {
        // setTimeout(() => mongoose.disconnect(), 3000); // Wait for emails
    }
};

testSpecificEmail();
