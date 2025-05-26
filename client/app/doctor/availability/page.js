import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDoctorAvailability, setDoctorAvailability } from "@/lib/api";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Availability() {
    const [availability, setAvailability] = useState([
        { day: 'Monday', isAvailable: false, openTime: '09:00', closeTime: '17:00' },
        { day: 'Tuesday', isAvailable: false, openTime: '09:00', closeTime: '17:00' },
        { day: 'Wednesday', isAvailable: false, openTime: '09:00', closeTime: '17:00' },
        { day: 'Thursday', isAvailable: false, openTime: '09:00', closeTime: '17:00' },
        { day: 'Friday', isAvailable: false, openTime: '09:00', closeTime: '17:00' },
        { day: 'Saturday', isAvailable: false, openTime: '09:00', closeTime: '17:00' },
        { day: 'Sunday', isAvailable: false, openTime: '09:00', closeTime: '17:00' },
    ])

    const [doctorId, setDoctorId] = useState(null)
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
            setDoctorId(decoded.id)
            const fetchAvailability = async () => {
                try {
                    const { data } = await getDoctorAvailability(decoded.id)
                    if (data.length > 0) {
                        setAvailability(data)
                    }
                } catch (error) {
                    setError('Failed to load availability')
                } finally {
                    setLoading(false)
                }
            }
            fetchAvailability()
        } catch (error) {
            router.push('/doctor/login')
        }
    }, [router])

    const handleAvailabilityChange = (day, field, value) => {
        setAvailability((prev) =>
            prev.map((slot) =>
                slot.day === day
                    ? {
                        ...slot,
                        [field]: value,
                        ...(field === 'isAvailable' && !value ? { openTime: null, closeTime: null } : {}),
                    }
                    : slot
            )
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await setDoctorAvailability(doctorId, { availability })
            alert('Availability updated successfully')
        } catch (error) {
            setError(error.response?.data.error || 'Failed to update availability')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-green-100">
            <div className="container mx-auto py-8">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-3xl text-primary">Set Availability</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {availability.map((slot) => (
                                <div key={slot.day} className="flex items-center space-x-4">
                                    <Checkbox
                                        id={`${slot.day}-available`}
                                        checked={slot.isAvailable}
                                        onCheckedChange={(checked) => handleAvailabilityChange(slot.day, 'isAvailable', checked)}
                                    />
                                    <Label htmlFor={`${slot.day}-available`} className="w-24">{slot.day}</Label>
                                    <div className="flex-1 flex space-x-2">
                                        <div className="w-1/2">
                                            <Label htmlFor={`${slot.day}-open`}>Open</Label>
                                            <Select
                                                value={slot.openTime || ''}
                                                onValueChange={(value) => handleAvailabilityChange(slot.day, 'openTime', value)}
                                                disabled={!slot.isAvailable}
                                            >
                                                <SelectTrigger id={`${slot.day}-open`}>
                                                    <SelectValue placeholder="Select time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timeOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-1/2">
                                            <Label htmlFor={`${slot.day}-close`}>Close</Label>
                                            <Select
                                                value={slot.closeTime || ''}
                                                onValueChange={(value) => handleAvailabilityChange(slot.day, 'closeTime', value)}
                                                disabled={!slot.isAvailable}
                                            >
                                                <SelectTrigger id={`${slot.day}-close`}>
                                                    <SelectValue placeholder="Select time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timeOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {error && <p className="text-red-500">{error}</p>}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Availability'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}