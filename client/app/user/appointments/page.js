'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserAppointments, cancelAppointment, rescheduleAppointment, getAvailableSlots } from '../../../lib/api'
import { Button } from '../../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { jwtDecode } from 'jwt-decode'

export default function MyAppointments() {
    const [appointments, setAppointments] = useState([])
    const [userId, setUserId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '' })
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
    const [rescheduleModal, setRescheduleModal] = useState({ open: false, appointmentId: null, doctorId: null })
    const [rescheduleForm, setRescheduleForm] = useState({ date: '', timeSlot: '' })
    const [availableSlots, setAvailableSlots] = useState([])
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }

        try {
            const decoded = jwtDecode(token)
            if (decoded.iss !== 'user') {
                router.push('/')
                return
            }
            setUserId(decoded.id)
            fetchAppointments(decoded.id, filters, pagination)
        } catch (err) {
            router.push('/login')
        }
    }, [router, filters, pagination.page, pagination])

    const fetchAppointments = async (userId, filters, pagination) => {
        try {
            const { data } = await getUserAppointments(userId, {
                ...filters,
                page: pagination.page,
                limit: pagination.limit,
            })
            setAppointments(data.appointments)
            setPagination((prev) => ({ ...prev, total: data.total }))
        } catch (err) {
            setError('Failed to load appointments')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async (appointmentId) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return

        try {
            await cancelAppointment(appointmentId)
            fetchAppointments(userId, filters, pagination)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to cancel appointment')
        }
    }

    const openRescheduleModal = async (appointmentId, doctorId) => {
        setRescheduleModal({ open: true, appointmentId, doctorId })
        setRescheduleForm({ date: new Date().toISOString().split('T')[0], timeSlot: '' })
        try {
            const { data } = await getAvailableSlots(doctorId, rescheduleForm.date)
            setAvailableSlots(data)
        } catch (err) {
            setError('Failed to load available slots')
        }
    }

    const handleReschedule = async (e) => {
        e.preventDefault()
        try {
            await rescheduleAppointment(rescheduleModal.appointmentId, {
                date: new Date(`${rescheduleForm.date}T${rescheduleForm.timeSlot}`),
            })
            setRescheduleModal({ open: false, appointmentId: null, doctorId: null })
            fetchAppointments(userId, filters, pagination)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reschedule appointment')
        }
    }

    const handleDateChange = async (e) => {
        const newForm = { ...rescheduleForm, date: e.target.value, timeSlot: '' }
        setRescheduleForm(newForm)
        try {
            const { data } = await getAvailableSlots(rescheduleModal.doctorId, newForm.date)
            setAvailableSlots(data)
        } catch (err) {
            setError('Failed to load available slots')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-green-100">
            <div className="container mx-auto py-8">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-3xl text-primary">My Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 flex flex-col sm:flex-row gap-4">
                            <div>
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                                    value={filters.status}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Doctor</TableHead>
                                            <TableHead>Date & Time</TableHead>
                                            <TableHead>Notes</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {appointments.map((appointment) => (
                                            <TableRow key={appointment._id}>
                                                <TableCell>{appointment.doctor.name}</TableCell>
                                                <TableCell>
                                                    {new Date(appointment.date).toLocaleString('en-US', {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short',
                                                    })}
                                                </TableCell>
                                                <TableCell>{appointment.notes}</TableCell>
                                                <TableCell>{appointment.status}</TableCell>
                                                <TableCell>
                                                    {appointment.status === 'scheduled' && (
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                variant="destructive"
                                                                onClick={() => handleCancel(appointment._id)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                onClick={() => openRescheduleModal(appointment._id, appointment.doctor._id)}
                                                            >
                                                                Reschedule
                                                            </Button>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="flex justify-between mt-4">
                                    <Button
                                        disabled={pagination.page === 1}
                                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    >
                                        Previous
                                    </Button>
                                    <span>
                                        Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                                    </span>
                                    <Button
                                        disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Dialog open={rescheduleModal.open} onOpenChange={() => setRescheduleModal({ open: false, appointmentId: null, doctorId: null })}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reschedule Appointment</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleReschedule} className="space-y-4">
                            <div>
                                <Label htmlFor="rescheduleDate">Date</Label>
                                <Input
                                    id="rescheduleDate"
                                    type="date"
                                    value={rescheduleForm.date}
                                    onChange={handleDateChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="timeSlot">Time Slot</Label>
                                <Select
                                    onValueChange={(value) => setRescheduleForm({ ...rescheduleForm, timeSlot: value })}
                                    value={rescheduleForm.timeSlot}
                                >
                                    <SelectTrigger id="timeSlot">
                                        <SelectValue placeholder="Select time slot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSlots.map((slot) => (
                                            <SelectItem key={slot.time} value={slot.time}>
                                                {slot.display}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {error && <p className="text-red-500">{error}</p>}
                            <Button type="submit" className="w-full" disabled={!rescheduleForm.date || !rescheduleForm.timeSlot}>
                                Reschedule
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}