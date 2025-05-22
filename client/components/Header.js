"use client"
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user, setUser] = useState(null)
    const [isDoctor, setIsDoctor] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            try {
                const decoded = jwtDecode(token)
                setIsLoggedIn(true)
                setUser(decoded)
                setIsDoctor(decoded.iss === 'doctor')
            } catch (error) {
                console.error('Invalid token:', error)
            }
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        window.location.href = '/'
    }
    return (
        <header className="w-full bg-green-500 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">
                    Medicall
                </Link>
                <nav className="flex items-center space-x-4">
                    {isLoggedIn ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center space-x-2 cursor-pointer">
                                    <Avatar>
                                        <AvatarImage src="/user.png" alt="Profile" />
                                        <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <span>{user?.name || 'User'}</span>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {!isDoctor && (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href="/user/profile">Profile</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/user/appointments">My Appointments</Link>
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {isDoctor && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/doctor/dashboard">Dashboard</Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={handleLogout}>
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="space-x-4">
                            <Button variant="outline" asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/signup">Signup</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/doctor/login">Doctor Login</Link>
                            </Button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}