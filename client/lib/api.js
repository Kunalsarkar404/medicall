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
export const loginDoctor = (data) => api.post('/doctors/login', data)
export const getDoctorAppointments = (doctorId) => api.get(`/appointments/doctor/${doctorId}`)
export const cancelAppointment = (appointmentId) => api.put(`/appointments/${appointmentId}/cancel`)
export const getUserAppointments = (userId, params) => api.get(`/appointments/user/${userId}`, { params })
export const updateUserProfile = (userId, data) => api.put(`/users/${userId}`, data)
export const rescheduleAppointment = (appointmentId, data) => api.put(`/appointments/${appointmentId}/reschedule`, data)
export const setDoctorAvailability = (doctorId, data) => api.put(`/doctors/${doctorId}/availabity`, data)
export const getDoctorAvailability = (doctorId) => api.get(`/doctors/${doctorId}/availability`)

export default api