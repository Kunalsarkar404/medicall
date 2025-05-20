const cron = require('node-cron')
const Appointment = require('../models/Appointment')
const { sendEmail } = require('./email')
const { sendSMS } = require('./sms')

const schedulerRemiders = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        try {
            const now = new Date()
            const reminderTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)

            const appointments = await Appointment.find({
                status: 'scheduled',
                date: {
                    $gte: reminderTime,
                    $lt: new Date(reminderTime.getTime() + 60 * 60 * 1000),
                }
            }).populate('user doctor')
            for (const appointment of appointments) {
                const { user, doctor, date } = appointment
                const formattedDate = date.toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                })

                //Send email
                if (user.email) {
                    await sendEmail({
                        to: user.email,
                        subject: 'Medicall Appointment Reminder',
                        text: `Dear ${user.name}, \n\nThis is a reminder for your appointment with ${doctor.name} on ${formattedDate}.\n\nThank you, \nMedicall Team`,
                    })
                }

                //Send SMS
                await sendSMS({
                    to: user.mobile,
                    body: `Reminder: Your appointment with ${doctor.name} is on ${formattedDate}.`,
                })
            }
        } catch (error) {
            console.error('Error in reminder scheduler:', error)
        }
    })
}

module.exports = { schedulerRemiders }

