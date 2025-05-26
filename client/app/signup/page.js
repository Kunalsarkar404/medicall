"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Signup() {
    const [form, setForm] = useState({ mobile: '', name: '', email: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await registerUser(form)
            router.push('/login')
        } catch (error) {
            setError(error.response?.data?.error || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="my-5">
                <h1 className="text-4xl font-bold text-green-700">Welcome to Rakshaya</h1>
                <p className="mt-2 text-lg text-center text-gray-600">
                    Jab zarurat ho, hum saath hain.
                </p>
            </div>
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-primary text-center">Signup</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <Input
                                id="mobile"
                                type="tel"
                                value={form.mobile}
                                className="mt-2"
                                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                                placeholder="1234567890"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={form.name}
                                className="mt-2"
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email (Optional)</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.email}
                                className="mt-2"
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="john@example.com"
                            />
                        </div>
                        {error && <p className="text-red-500">{error}</p>}
                        <Button type="submit" className="w-full bg-green-700" disabled={loading}>
                            {loading ? 'Signing up...' : 'Signup'}
                        </Button>
                        <p className="text-center text-sm text-gray-600">
                            Already have an account?{" "}
                            <span
                                className="text-green-700 cursor-pointer hover:underline"
                                onClick={() => router.push("/login")}
                            >
                                Login here
                            </span>
                        </p>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}