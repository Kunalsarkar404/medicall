const asyncHandler = require('express-async-handler')
const Appointment = require('../models/Appointment')
const User = require('../models/User')
const Doctor = require('../models/Doctor')

// Create a new appointment
const createAppointment = asyncHandler(async (req, res) => {
    const { userId, doctorId, date, notes } = req.body

    // Validate input
    if (!userId || !doctorId || !date) {
        res.status(400)
        throw new Error('User ID, Doctor ID, and date are required')
    }

    // Verify user and doctor exist
    const user = await User.findById(userId)
    const doctor = await Doctor.findById(doctorId)
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }
    if (!doctor) {
        res.status(404)
        throw new Error('Doctor not found')
    }

    // Parse appointment date
    const appointmentDate = new Date(date)
    if (isNaN(appointmentDate)) {
        res.status(400)
        throw new Error('Invalid date format')
    }

    // Check for overlapping appointments
    const slotDuration = 30 * 60 * 1000 // 30 minutes in milliseconds
    const startTime = new Date(appointmentDate)
    const endTime = new Date(appointmentDate.getTime() + slotDuration)

    const overlappingAppointments = await Appointment.find({
        doctor: doctorId,
        status: 'scheduled',
        date: {
            $gte: new Date(startTime.getTime() - slotDuration),
            $lt: endTime,
        },
    })

    if (overlappingAppointments.length > 0) {
        res.status(400)
        throw new Error('Doctor is already booked for this time slot')
    }

    // Create appointment
    const appointment = new Appointment({
        user: userId,
        doctor: doctorId,
        date: appointmentDate,
        notes,
    })
    await appointment.save()

    // Update user and doctor appointments
    user.appointments.push(appointment._id)
    doctor.appointments.push(appointment._id)
    await user.save()
    await doctor.save()

    res.status(201).json({ message: 'Appointment created successfully', appointment })
})

module.exports = { createAppointment }