const asyncHandler = require('express-async-handler')
const User = require('../models/User')
const OTP = require('../models/OTP')
const jwt = require('jsonwebtoken')
require('dotenv').config();
const twilio = require('twilio')

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// Register a new user (patient)
const registerUser = asyncHandler(async (req, res) => {
    const { mobile, name, email } = req.body

    if (!mobile || !name) {
        res.status(400)
        throw new Error('Mobile and name are required')
    }

    const existingUser = await User.findOne({ mobile })
    if (existingUser) {
        res.status(400)
        throw new Error('Mobile number already registered')
    }

    const user = new User({ mobile, name, email })
    await user.save()

    res.status(201).json({ message: 'User registered successfully', user: { id: user._id, mobile, name, email } })
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

    // Generate 6-digit OTP
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

// Get user profile (protected)
const getUserProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const user = await User.findById(userId).select('-__v')
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }
    res.json(user)
})

module.exports = { registerUser, sendOTP, verifyOTP, getUserProfile }