const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const routes = require('./routes');

require('./models/User')
require('./models/Doctor')
require('./models/Appointment')
require('./models/OTP')

dotenv.config()
const app = express()

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api', routes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));