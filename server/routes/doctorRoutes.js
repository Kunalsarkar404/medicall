const express = require('express')
const { registerDoctor, getAllDoctors, loginDoctor, getAvailableSlots } = require('../controllers/doctorController')
const { protect, restrictTo } = require('../middleware/auth')
const doctorRouter = express.Router()

doctorRouter.post('/register', protect, registerDoctor)
doctorRouter.post('/login', protect, loginDoctor)
doctorRouter.get('/', getAllDoctors)
doctorRouter.get('/slots', getAvailableSlots)

module.exports = doctorRouter