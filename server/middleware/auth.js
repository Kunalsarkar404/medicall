const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/User')
const Doctor = require('../models/Doctor')

// Protect routes with JWT
const protect = asyncHandler(async (req, res, next) => {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Check if user or doctor
            if (decoded.role === 'user') {
                req.user = await User.findById(decoded.id).select('-__v')
                if (!req.user) {
                    return res.status(401).json({ error: 'User not found' })
                }
            } else if (decoded.role === 'doctor') {
                req.doctor = await Doctor.findById(decoded.id).select('-password -__v')
                if (!req.doctor) {
                    return res.status(401).json({ error: 'Doctor not found' })
                }
            } else {
                return res.status(401).json({ error: 'Invalid role' })
            }

            next()
        } catch (error) {
            console.error('Auth error:', error)
            res.status(401).json({ error: 'Not authorized, token failed' })
        }
    } else {
        res.status(401).json({ error: 'Not authorized, no token' })
    }
})

// Restrict to specific roles
const restrictTo = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user ? 'user' : req.doctor ? 'doctor' : null
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({ error: 'Access denied' })
        }
        next()
    }
}

module.exports = { protect, restrictTo }