const express = require('express')
const { createAppointment, cancelAppointment, getDoctorAppointments, rescheduleAppointment, getUserAppointments } = require('../controllers/appointmentController')
const { protect, restrictTo } = require('../middleware/auth')
const appointmentRouter = express.Router()

appointmentRouter.post('/', protect, restrictTo('user'), createAppointment)
appointmentRouter.put('/:appointment/cancel', protect, restrictTo('user', 'doctor'), cancelAppointment)
appointmentRouter.put('/:appointmentId/reschedule', protect, restrictTo('user', 'doctor'), rescheduleAppointment)
appointmentRouter.get('/doctor/:doctorId', protect, restrictTo('doctor'), getDoctorAppointments)
appointmentRouter.get('/user/:userId', protect, restrictTo('user'), getUserAppointments)

module.exports = appointmentRouter