"use client"

import { createAppointment, getAvailableSlots } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Label } from "./ui/label"
import { Input } from "./ui/input"

export default function BookingModal({ isOpen, onClose, doctor, user }) {
    const [form, setForm] = useState({
        patientName: user?.name || '',
        relation: 'Self',
        age: '',
        date: new Date().toISOString().split('T')[0],
        timeSlot: '',
    })
    const [availableSlots, setAvailableSlots] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (isOpen && doctor?._id) {
            const fetchSlots = async () => {
                try {
                    const { data } = await getAvailableSlots(doctor._id, form.date)
                    setAvailableSlots(data)
                } catch (error) {
                    setError('Failed to load available slots')
                }
            }
            fetchSlots()
        }
    }, [isOpen, doctor, form.date])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (!user) {
                router.push('/login')
                return
            }
            await createAppointment({
                userId: user.id,
                doctorId: doctor._id,
                date: new Date(`${form.date}T${form.timeSlot}`),
                notes: `Patient: ${form.patientName}, Relation: ${form.relation}, Age: ${form.age}`,
            })
            onClose()
            router.refresh()
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to book appointment')
        } finally {
            setLoading(false)
        }
    }
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Book Appointment with {doctor?.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="patientName">Patient Name</Label>
                        <Input
                            id="patientName"
                            value={form.patientName}
                            onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="relation">Relation with Patient</Label>
                        <Select
                            onValueChange={(value) => setForm({ ...form, relation: value })}
                            value={form.relation}
                        >
                            <SelectTrigger id="relation">
                                <SelectValue placeholder="Select relation" />
                            </SelectTrigger>
                            <SelectContent>
                                {['Self', 'Mother', 'Father', 'Brother', 'Other'].map((rel) => (
                                    <SelectItem key={rel} value={rel}>
                                        {rel}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                            id="age"
                            type="number"
                            value={form.age}
                            onChange={(e) => setForm({ ...form, age: e.target.value })}
                            placeholder="Enter age"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value, timeSlot: '' })}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="timeSlot">Time Slot</Label>
                        <Select
                            onValueChange={(value) => setForm({ ...form, timeSlot: value })}
                            value={form.timeSlot}
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
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || !form.patientName || !form.age || !form.date || !form.timeSlot}
                    >
                        {loading ? 'Booking...' : 'Book Now'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}