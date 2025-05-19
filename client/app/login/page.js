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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-100 to-green-500">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-primary">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    {step === 'send' ? (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div>
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
                            <Button type="submit" className="w-full" disabled={loading}>
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
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}