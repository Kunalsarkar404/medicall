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

    const doctor = new Doctor({
        username, password, name, specialty, profilePicture,
        availabilty: [
            { day: 'Monday', isAvailable: false },
            { day: 'Tuesday', isAvailable: false },
            { day: 'Wednesday', isAvailable: false },
            { day: 'Thursday', isAvailable: false },
            { day: 'Friday', isAvailable: false },
            { day: 'Saturday', isAvailable: false },
            { day: 'Sunday', isAvailable: false },
        ]
    })
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

    const token = generateToken(doctor._id, doctor.name, doctor.username, doctor.specialty)

    res.json({
        message: 'Login successful',
        token,
        doctor: { id: doctor._id, username: doctor.username, name: doctor.name, specialty: doctor.specialty },
    })
})

// Set doctor availability
const setAvailability = asyncHandler(async (req, res) => {
    const { doctorId } = req.params
    const { availability } = req.body

    if (!Array.isArray(availability)) {
        res.status(400)
        throw new Error('Availability must be an array')
    }

    const doctor = await Doctor.findById(doctorId)
    if (!doctor) {
        res.status(404)
        throw new Error('Doctor not found')
    }

    // Verify only the doctor can update their availability
    if (doctor._id.toString() !== req.doctor._id.toString()) {
        res.status(403)
        throw new Error('Not authorized to update this doctor’s availability')
    }

    // Validate availability
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    for (const slot of availability) {
        if (!validDays.includes(slot.day)) {
            res.status(400)
            throw new Error(`Invalid day: ${slot.day}`)
        }
        if (slot.isAvailable && (!slot.openTime || !slot.closeTime)) {
            res.status(400)
            throw new Error(`Open and close times required for available day: ${slot.day}`)
        }
    }

    doctor.availability = availability
    await doctor.save()

    res.json({ message: 'Availability updated successfully', availability: doctor.availability })
})

// Get all doctors
const getAllDoctors = asyncHandler(async (req, res) => {
    const doctors = await Doctor.find().select('_id name specialty profilePicture')
    res.json(doctors)
})

// Get doctor availability
const getAvailability = asyncHandler(async (req, res) => {
    const { doctorId } = req.params

    const doctor = await Doctor.findById(doctorId).select('availability')
    if (!doctor) {
        res.status(404)
        throw new Error('Doctor not found')
    }

    res.json(doctor.availability)
})

module.exports = { registerDoctor, loginDoctor, getAllDoctors, setAvailability, getAvailability }