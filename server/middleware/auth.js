const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/User')
const Doctor = require('../models/Doctor')

const protect = asyncHandler(async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            if (decoded.iss === 'user') {
                req.user = await User.findById(decoded.id).select('-password')
                if (!req.user) {
                    res.status(401)
                    throw new Error('Not authorized, user not found')
                }
            } else if (decoded.iss === 'doctor') {
                req.doctor = await Doctor.findById(decoded.id).select('-password')
                if (!req.doctor) {
                    res.status(401)
                    throw new Error('Not authorized, doctor not found')
                }
            } else {
                res.status(401)
                throw new Error('Not authorized, invalid token issuer')
            }

            next()
        } catch (error) {
            console.error(error)
            res.status(401)
            throw new Error('Not authorized, token failed')
        }
    } else {
        res.status(401)
        throw new Error('Not authorized, no token')
    }
})

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (req.user && roles.includes('user')) {
            next()
        } else if (req.doctor && roles.includes('doctor')) {
            next()
        } else {
            res.status(403)
            throw new Error('Not authorized for this role')
        }
    }
}

module.exports = { protect, restrictTo }