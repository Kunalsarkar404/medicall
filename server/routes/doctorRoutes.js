const express = require('express')
const { registerDoctor, getAllDoctors, loginDoctor, setAvailability, getAvailability } = require('../controllers/doctorController')
const { protect, restrictTo } = require('../middleware/auth')
const doctorRouter = express.Router()

doctorRouter.post('/register', protect, registerDoctor)
doctorRouter.post('/login', protect, loginDoctor)
doctorRouter.get('/', getAllDoctors)
doctorRouter.put('/:doctorId/availability', protect, restrictTo('doctor'), setAvailability)
doctorRouter.get('/:doctorId/availability', protect, getAvailability)

module.exports = doctorRouter