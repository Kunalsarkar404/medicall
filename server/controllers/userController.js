const asyncHandler = require('express-async-handler')
const User = require('../models/User')
const OTP = require('../models/OTP')
const { sendSMS } = require('../utils/sms')
const jwt = require('jsonwebtoken')
require('dotenv').config();
const twilio = require('twilio')

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// Generate JWT
const generateToken = (id, name, email, mobile) => {
    return jwt.sign({ id, name, email, mobile, iss: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// Register user
const registerUser = asyncHandler(async (req, res) => {
    const { name, mobile, email, password } = req.body

    if (!name || !mobile || !password) {
        res.status(400)
        throw new Error('Name, mobile, and password are required')
    }

    const existingUser = await User.findOne({ mobile })
    if (existingUser) {
        res.status(400)
        throw new Error('Mobile number already registered')
    }

    const user = new User({ name, mobile, email, password })
    await user.save()

    const token = generateToken(user._id, user.name, user.email, user.mobile)

    res.status(201).json({ message: 'User registered successfully', token })
})

// Send OTP
const sendOTP = asyncHandler(async (req, res) => {
    const { mobile } = req.body

    if (!mobile) {
        res.status(400)
        throw new Error('Mobile number is required')
    }

    const user = await User.findOne({ mobile })
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    // Save OTP to database
    await OTP.create({ mobile, otp })

    // Send OTP via Twilio
    await client.messages.create({
        body: `Your Medicall OTP is ${otp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${mobile}`, // Adjust country code as needed
    }).then(msg => console.log(msg.id))

    res.json({ message: 'OTP sent successfully' })
})

// Verify OTP and login
const verifyOTP = asyncHandler(async (req, res) => {
    const { mobile, otp } = req.body

    if (!mobile || !otp) {
        res.status(400)
        throw new Error('Mobile number and OTP are required')
    }

    const otpRecord = await OTP.findOne({ mobile, otp })
    if (!otpRecord) {
        res.status(400)
        throw new Error('Invalid or expired OTP')
    }

    const user = await User.findOne({ mobile })
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id })

    // Generate JWT
    const token = generateToken(user._id, 'user')

    res.json({
        message: 'Login successful',
        token,
        user: { id: user._id, mobile, name: user.name, email: user.email },
    })
})
// Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { name, email, mobile } = req.body

    if (!name || !mobile) {
        res.status(400)
        throw new Error('Name and mobile are required')
    }

    const user = await User.findById(userId)
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    // Check if mobile is taken by another user
    const existingUser = await User.findOne({ mobile, _id: { $ne: userId } })
    if (existingUser) {
        res.status(400)
        throw new Error('Mobile number already registered')
    }

    user.name = name
    user.email = email || ''
    user.mobile = mobile
    await user.save()

    const token = generateToken(user._id, user.name, user.email, user.mobile)

    res.json({
        message: 'Profile updated successfully',
        token,
        user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile },
    })
})

module.exports = { registerUser, sendOTP, verifyOTP, updateUserProfile }