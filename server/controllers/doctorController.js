const asyncHandler = require('express-async-handler')
const Doctor = require('../models/Doctor')
const jwt = require('jsonwebtoken')
const Appointment = require('../models/Appointment')

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// Register a new doctor (admin)
const registerDoctor = asyncHandler(async (req, res) => {
    const { username, password, name, specialty, profilePicture } = req.body

    if (!username || !password || !name) {
        res.status(400)
        throw new Error('Username, password, and name are required')
    }

    const existingDoctor = await Doctor.findOne({ username })
    if (existingDoctor) {
        res.status(400)
        throw new Error('Username already taken')
    }

    const doctor = new Doctor({ username, password, name, specialty, profilePicture })
    await doctor.save()

    res.status(201).json({ message: 'Doctor registered successfully', doctor: { id: doctor._id, username, name, specialty } })
})

// Login doctor
const loginDoctor = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        res.status(400)
        throw new Error('Username and password are required')
    }

    const doctor = await Doctor.findOne({ username })
    if (!doctor || !(await doctor.comparePassword(password))) {
        res.status(401)
        throw new Error('Invalid credentials')
    }

    const token = generateToken(doctor._id, 'doctor')

    res.json({
        message: 'Login successful',
        token,
        doctor: { id: doctor._id, username, name: doctor.name, specialty: doctor.specialty },
    })
})

// Get all doctors
const getAllDoctors = asyncHandler(async (req, res) => {
    const doctors = await Doctor.find().select('_id name specialty profilePicture')
    res.json(doctors)
})

const getAvailableSlots = asyncHandler(async (req, res) => {
    const { doctorId, date } = req.body

    if (!doctorId || !date) {
        res.status(400)
        throw new Error('Doctor ID and date are required')
    }

    const selectedDate = new Date(date)
    if (isNaN(selectedDate)) {
        res.status(400)
        throw new Error('Invalid date format')
    }

    // Define working hours (e.g., 9 AM to 5 PM)
    const startHour = 9
    const endHour = 17
    const slotDuration = 30 * 60 * 1000 // 30 minutes

    const slots = []
    let currentTime = new Date(selectedDate.setHours(startHour, 0, 0, 0))
    const endTime = new Date(selectedDate.setHours(endHour, 0, 0, 0))

    while (currentTime < endTime) {
        slots.push(new Date(currentTime))
        currentTime = new Date(currentTime.getTime() + slotDuration)
    }

    // Find booked slots
    const bookedAppointments = await Appointment.find({
        doctor: doctorId,
        status: 'scheduled',
        date: {
            $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
            $lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
        },
    }).select('date')

    const bookedTimes = bookedAppointments.map((app) => new Date(app.date).getTime())

    // Filter available slots
    const availableSlots = slots.filter(
        (slot) => !bookedTimes.some(
            (booked) => Math.abs(slot.getTime() - booked) < slotDuration / 2
        )
    )

    res.json(availableSlots.map((slot) => ({
        time: slot.toISOString(),
        display: slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })))
})

module.exports = { registerDoctor, loginDoctor, getAllDoctors, getAvailableSlots }