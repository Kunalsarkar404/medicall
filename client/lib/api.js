import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const registerUser = (data) => api.post('/users/register', data)
export const sendOTP = (data) => api.post('/users/send-otp', data)
export const verifyOTP = (data) => api.post('/users/verify-otp', data)
export const getDoctors = () => api.get('/doctors')
export const createAppointment = (data) => api.post('/appointments', data)
export const getAvailableSlots = (doctorId, date) => api.get(`/doctors/slots?doctorId=${doctorId}&date=${date}`)

export default api