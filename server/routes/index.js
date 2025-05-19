const express = require('express');
const userRouter = require('./userRoutes');
const doctorRouter = require('./doctorRoutes');
const appointmentRouter = require('./appointmentRoutes');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'VaishyaPlus API' })
})

router.use('/users', userRouter)
router.use('/doctors', doctorRouter)
router.use('/appointments', appointmentRouter)

module.exports = router