"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cancelAppointment, getDoctorAppointments } from "@/lib/api"
import { jwtDecode } from "jwt-decode"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DoctorDashboard() {
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/doctor/login')
            return
        }

        try {
            const decoded = jwtDecode(token)
            if (decoded.iss !== 'doctor') {
                router.push('/')
                return
            }

            const fetchAppointments = async () => {
                try {
                    const { data } = await getDoctorAppointments(decoded.id)
                    setAppointments(data)
                } catch (error) {
                    setError('Failed to load appointments')
                } finally {
                    setLoading(false)
                }
            }
            fetchAppointments()
        } catch (error) {
            router.push('/doctor/login')
        }
    }, [router])

    const handleCancel = async (appointmentId) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return

        try {
            await cancelAppointment(appointmentId)
            setAppointments(appointments.filter((app) => app._id !== appointmentId))
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to cancel appointment')
        }
    }
    return (
        <div className="min-h-screen">
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-semibold text-primary">Doctor Dashboard</h1>
                    <Link href="/doctor/availability">
                        <Button>Set Availability</Button>
                    </Link>
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appointments.map((appointment) => (
                                <TableRow key={appointment._id}>
                                    <TableCell>{appointment.user.name}</TableCell>
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
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleCancel(appointment._id)}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    )
}