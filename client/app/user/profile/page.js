'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserProfile } from '../../../lib/api'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { jwtDecode } from 'jwt-decode'

export default function UserProfile() {
    const [form, setForm] = useState({ name: '', email: '', mobile: '' })
    const [userId, setUserId] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
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
            setForm({
                name: decoded.name || '',
                email: decoded.email || '',
                mobile: decoded.mobile || '',
            })
        } catch (err) {
            router.push('/login')
        }
    }, [router])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { data } = await updateUserProfile(userId, form)
            localStorage.setItem('token', data.token)
            router.push('/user/profile')
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-green-100">
            <div className="container mx-auto py-8">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="text-3xl text-primary">Edit Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Enter name"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="Enter email"
                                />
                            </div>
                            <div>
                                <Label htmlFor="mobile">Mobile</Label>
                                <Input
                                    id="mobile"
                                    value={form.mobile}
                                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                                    placeholder="Enter mobile"
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500">{error}</p>}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Profile'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}