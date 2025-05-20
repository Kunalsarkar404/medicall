const express = require('express')
const { createAppointment, cancelAppointment } = require('../controllers/appointmentController')
const { protect, restrictTo } = require('../middleware/auth')
const appointmentRouter = express.Router()

appointmentRouter.post('/', protect, restrictTo('user'), createAppointment)
appointmentRouter.put('/:appointment/cancel', protect, restrictTo('user', 'doctor'), cancelAppointment)

module.exports = appointmentRouter