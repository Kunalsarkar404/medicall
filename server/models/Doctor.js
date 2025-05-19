const mongoose = require("mongoose");
const bcrypt = require('bcrypt')

const doctorScheme = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: [true, 'Username is required'],
        unique: true,
        minlength: [4, 'Username must be atleast 4 characters'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be atleast 8 characters'],
    },
    name: {
        type: 'String',
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be atleast 2 characters'],
    },
    specialty: {
        type: String,
        trim: true,
        default: '',
    },
    profilePicture: {
        type: String,
        default: '',
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

doctorScheme.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

doctorScheme.methods.comparePassword = async function (password) {
    return await bcrypt.password(password, this.password);
}

module.exports = mongoose.model('Doctor', doctorScheme)