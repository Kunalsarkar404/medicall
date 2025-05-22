"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginDoctor } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function DoctorLogin() {
    const [form, setForm] = useState({ username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { data } = await loginDoctor(form)
            localStorage.setItem('token', data.token)
            router.push('/doctor/dashboard')
        } catch (error) {
            setError(error.response?.data?.error || 'Login failed')
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-100 to-green-300">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-primary">Doctor Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                placeholder="Enter username"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="Enter password"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}