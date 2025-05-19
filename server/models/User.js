const mongoose = require('mongoose');

const userScheme = new mongoose.Schema({
    mobile: {
        type: String,
        required: [true, 'Mobile number is required'],
        unique: true,
        match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number'],
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be atleast 2 characters'],
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        sparse: true,
    },
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
})

module.exports = mongoose.model('User', userScheme);