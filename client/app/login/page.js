"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOTP, verifyOTP } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
    const [step, setStep] = useState('send')
    const [mobile, setMobile] = useState('')
    const [otp, setOtp] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSendOTP = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await sendOTP({ mobile })
            setStep('verify')
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { data } = await verifyOTP({ mobile, otp })
            localStorage.setItem('token', data.token)
            router.push('/')
        } catch (error) {
            setError(err.response?.data?.error || 'Invalid OTP')
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
                    <CardTitle className="text-2xl text-primary text-center">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    {step === 'send' ? (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div className="space-y-3">
                                <Label htmlFor="mobile">Mobile Number</Label>
                                <Input
                                    id="mobile"
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="1234567890"
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500">{error}</p>}
                            <Button type="submit" className="w-full bg-green-700" disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div>
                                <Label htmlFor="otp">OTP</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500">{error}</p>}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                            <p className="mt-4 text-center text-sm text-gray-600">
                                Don’t have an account?{" "}
                                <span
                                    className="text-green-700 cursor-pointer hover:underline"
                                    onClick={() => router.push("/signup")}
                                >
                                    Sign up here
                                </span>
                            </p>

                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}