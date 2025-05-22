const express = require('express')
const { registerUser, sendOTP, verifyOTP, updateUserProfile } = require('../controllers/userController')
const { protect, restrictTo } = require('../middleware/auth')
const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/send-otp', sendOTP)
userRouter.post('/verify-otp', verifyOTP)
userRouter.get('/:userId', protect, restrictTo('user'), updateUserProfile)

module.exports = userRouter