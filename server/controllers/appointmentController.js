const asyncHandler = require('express-async-handler')
const Appointment = require('../models/Appointment')
const User = require('../models/User')
const Doctor = require('../models/Doctor')
const { sendEmail } = require('../utils/email')
const { sendSMS } = require('../utils/sms')

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

    //Send booking confirmation
    const formattedDate = appointmentDate.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    })

    if (user.email) {
        await sendEmail({
            to: user.email,
            subject: 'Medicall Appointment Confirmation',
            text: `Dear ${user.name}, \n\nYour appointment with ${doctor.name} on ${formattedDate} has been confirmed.\n\nDetails: ${notes}\n\nThank you, \nMedicalPlus Team`,
        })
    }

    await sendSMS({
        to: user.mobile,
        body: `Your appointment with ${doctor.name} on ${formattedDate} is confirmed.`,
    })

    res.status(201).json({ message: 'Appointment created successfully', appointment })
})

//Cancel an appointment
const cancelAppointment = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params

    const appointment = await Appointment.findById(appointmentId).populate('user doctor')
    if (!appointment) {
        res.status(404)
        throw new Error('Appointment not found')
    }
    if (appointment.status === 'cancelled') {
        res.status(400)
        throw new Error('Appointment already cancelled')
    }

    //Verify user or doctor can cancel
    const userId = req.user?._id?.toString()
    const doctorId = req.doctor?._id?.toString()
    if (appointment.user._id.toString() !== userId && appointment.doctor._id.toString() !== doctorId) {
        res.status(403)
        throw new Error('Not authorized to cancel this appointment')
    }

    appointment.status = 'cancelled'
    await appointment.save()

    // Send cancellation notification
    const formattedDate = appointment.date.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    })

    if (appointment.user.email) {
        await sendEmail({
            to: appointment.user.email,
            subject: 'Medicall Appointment Cancelled',
            text: `Dear ${appointment.user.name},\n\nYour appointment with ${appointment.doctor.name} on ${formattedDate} has been cancelled.\n\nThank you,\nMedicall Team`,
        })
    }

    await sendSMS({
        to: appointment.user.mobile,
        body: `Your appointment with ${appointment.doctor.name} on ${formattedDate} has been cancelled.`,
    })

    res.json({ message: 'Appointment cancelled successfully' })
})

module.exports = { createAppointment, cancelAppointment }