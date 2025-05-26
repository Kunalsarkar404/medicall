const asyncHandler = require('express-async-handler')
const Appointment = require('../models/Appointment')
const User = require('../models/User')
const Doctor = require('../models/Doctor')
const { sendEmail } = require('../utils/email')
const { sendSMS } = require('../utils/sms')

// Helper to generate time slots
const generateTimeSlots = (openTime, closeTime, slotDuration = 30) => {
    const slots = []
    let current = new Date(`1970-01-01T${openTime}:00`)
    const end = new Date(`1970-01-01T${closeTime}:00`)

    while (current < end) {
        const time = current.toTimeString().slice(0, 5)
        slots.push({
            time,
            display: current.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        })
        current = new Date(current.getTime() + slotDuration * 60 * 1000)
    }
    return slots
}

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

    // Check if the slot is within doctor's availability
    const dayOfWeek = appointmentDate.toLocaleString('en-US', { weekday: 'long' })
    const availability = doctor.availabilty.find((slot) => slot.day === dayOfWeek)
    if (!availability || !availability.isAvailable) {
        res.status(400)
        throw new Error(`Doctor is not available on ${dayOfWeek}`)
    }

    const appointmentTime = appointmentDate.toTimeString().slice(0, 5) // e.g., "09:00"
    if (appointmentTime < availability.openTime || appointmentTime >= availability.closeTime) {
        res.status(400)
        throw new Error(`Doctor is not available at ${appointmentTime}`)
    }

    // Check for overlapping appointments (30-minute slot)
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

    // Send booking confirmation
    const formattedDate = appointmentDate.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    })

    if (user.email) {
        await sendEmail({
            to: user.email,
            subject: 'Rakshaya Appointment Confirmation',
            text: `Dear ${user.name},\n\nYour appointment with ${doctor.name} on ${formattedDate} has been confirmed.\n\nDetails: ${notes}\n\nThank you,\nRakshaya Team`,
        })
    }

    await sendSMS({
        to: user.mobile,
        body: `Your appointment with ${doctor.name} on ${formattedDate} is confirmed.`,
    })

    res.status(201).json({ message: 'Appointment created successfully', appointment })
})

// Cancel an appointment
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

    // Verify user or doctor can cancel
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
            subject: 'Rakshaya Appointment Cancelled',
            text: `Dear ${appointment.user.name},\n\nYour appointment with ${appointment.doctor.name} on ${formattedDate} has been cancelled.\n\nThank you,\nRakshaya Team`,
        })
    }

    await sendSMS({
        to: appointment.user.mobile,
        body: `Your appointment with ${appointment.doctor.name} on ${formattedDate} has been cancelled.`,
    })

    res.json({ message: 'Appointment cancelled successfully' })
})

// Reschedule an appointment
const rescheduleAppointment = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params
    const { date } = req.body

    const appointment = await Appointment.findById(appointmentId).populate('user doctor')
    if (!appointment) {
        res.status(404)
        throw new Error('Appointment not found')
    }

    if (appointment.status !== 'scheduled') {
        res.status(400)
        throw new Error('Only scheduled appointments can be rescheduled')
    }

    // Verify user or doctor can reschedule
    const userId = req.user?._id?.toString()
    const doctorId = req.doctor?._id?.toString()
    if (appointment.user._id.toString() !== userId && appointment.doctor._id.toString() !== doctorId) {
        res.status(403)
        throw new Error('Not authorized to reschedule this appointment')
    }

    // Parse new date
    const newDate = new Date(date)
    if (isNaN(newDate)) {
        res.status(400)
        throw new Error('Invalid date format')
    }

    // Check if the slot is within doctor's availability
    const dayOfWeek = newDate.toLocaleString('en-US', { weekday: 'long' })
    const availability = appointment.doctor.availability.find((slot) => slot.day === dayOfWeek)
    if (!availability || !availability.isAvailable) {
        res.status(400)
        throw new Error(`Doctor is not available on ${dayOfWeek}`)
    }

    const appointmentTime = newDate.toTimeString().slice(0, 5) // e.g., "09:00"
    if (appointmentTime < availability.openTime || appointmentTime >= availability.closeTime) {
        res.status(400)
        throw new Error(`Doctor is not available at ${appointmentTime}`)
    }

    // Check for overlapping appointments
    const slotDuration = 30 * 60 * 1000 // 30 minutes
    const startTime = new Date(newDate)
    const endTime = new Date(newDate.getTime() + slotDuration)

    const overlappingAppointments = await Appointment.find({
        doctor: appointment.doctor._id,
        status: 'scheduled',
        _id: { $ne: appointmentId }, // Exclude current appointment
        date: {
            $gte: new Date(startTime.getTime() - slotDuration),
            $lt: endTime,
        },
    })

    if (overlappingAppointments.length > 0) {
        res.status(400)
        throw new Error('Doctor is already booked for this time slot')
    }

    appointment.date = newDate
    await appointment.save()

    // Send reschedule notification
    const formattedDate = newDate.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    })

    if (appointment.user.email) {
        await sendEmail({
            to: appointment.user.email,
            subject: 'Rakshaya Appointment Rescheduled',
            text: `Dear ${appointment.user.name},\n\nYour appointment with ${appointment.doctor.name} has been rescheduled to ${formattedDate}.\n\nThank you,\nVaishyaPlus Team`,
        })
    }

    await sendSMS({
        to: appointment.user.mobile,
        body: `Your appointment with ${appointment.doctor.name} has been rescheduled to ${formattedDate}.`,
    })

    res.json({ message: 'Appointment rescheduled successfully', appointment })
})

// Get doctor's appointments
const getDoctorAppointments = asyncHandler(async (req, res) => {
    const { doctorId } = req.params
    const appointments = await Appointment.find({ doctor: doctorId })
        .populate('user', 'name')
        .select('_id user date notes status')
    res.json(appointments)
})

// Get user's appointments with filters and pagination
const getUserAppointments = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { startDate, endDate, status, page = 1, limit = 10 } = req.query

    const query = { user: userId }
    if (startDate) query.date = { $gte: new Date(startDate) }
    if (endDate) query.date = { ...query.date, $lte: new Date(endDate) }
    if (status) query.status = status

    const total = await Appointment.countDocuments(query)
    const appointments = await Appointment.find(query)
        .populate('doctor', 'name')
        .select('_id doctor date notes status')
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ date: -1 }) // Newest first

    res.json({ appointments, total })
})

// Get available slots for a doctor on a specific date
const getAvailableSlots = asyncHandler(async (req, res) => {
    const { doctorId, date } = req.query

    if (!doctorId || !date) {
        res.status(400)
        throw new Error('Doctor ID and date are required')
    }

    const selectedDate = new Date(date)
    if (isNaN(selectedDate)) {
        res.status(400)
        throw new Error('Invalid date format')
    }

    const doctor = await Doctor.findById(doctorId)
    if (!doctor) {
        res.status(404)
        throw new Error('Doctor not found')
    }

    const dayOfWeek = selectedDate.toLocaleString('en-US', { weekday: 'long' })
    const availability = doctor.availability.find((slot) => slot.day === dayOfWeek)
    if (!availability || !availability.isAvailable) {
        return res.json([])
    }

    // Generate all possible slots
    let slots = generateTimeSlots(availability.openTime, availability.closeTime)

    // Filter out booked slots
    const slotDuration = 30 * 60 * 1000 // 30 minutes
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0))
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999))

    const bookedAppointments = await Appointment.find({
        doctor: doctorId,
        status: 'scheduled',
        date: { $gte: startOfDay, $lte: endOfDay },
    })

    const bookedTimes = bookedAppointments.map((app) => new Date(app.date).toTimeString().slice(0, 5))
    slots = slots.filter((slot) => !bookedTimes.includes(slot.time))

    res.json(slots)
})

module.exports = { createAppointment, cancelAppointment, rescheduleAppointment, getDoctorAppointments, getUserAppointments, getAvailableSlots }