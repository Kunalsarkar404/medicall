const { default: mongoose } = require("mongoose");

const otpSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: true,
        index: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300,
    }
})

module.exports = mongoose.model('OTP', otpSchema)