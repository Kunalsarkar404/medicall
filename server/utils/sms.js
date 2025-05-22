const twilio = require('twilio')
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

const sendSMS = async ({ to, body }) => {
    try {
        await client.messages.create({
            body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${to}`,
        })
        console.log(`SMS sent to ${to}`)
    } catch (error) {
        console.error('Error sending SMS:', error)
        throw new Error('Failed to send SMS')
    }
}

module.exports = { sendSMS }