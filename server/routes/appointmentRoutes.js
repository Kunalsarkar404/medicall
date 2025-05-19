const express = require('express')
const { createAppointment } = require('../controllers/appointmentController')
const { protect, restrictTo } = require('../middleware/auth')
const appointmentRouter = express.Router()

appointmentRouter.post('/', protect, restrictTo('user'), createAppointment)

module.exports = appointmentRouter