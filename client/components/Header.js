"use client"
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User as UserIcon } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname()
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
            } catch (err) {
                console.error('Invalid token:', err)
            }
        }
    }, [])

    if (['/login', '/signup', '/doctor/login'].includes(pathname)) {
        return null
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        window.location.href = '/'
    }
    return (
        <header className="w-full bg-green-700 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">
                    Rakshaya
                </Link>
                <nav className="flex items-center space-x-4">
                    {isLoggedIn ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center space-x-2 cursor-pointer">
                                    <Avatar>
                                        {user?.image ? (
                                            <AvatarImage
                                                src={user.image}
                                                alt="Profile"
                                                className="rounded-full object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full bg-muted rounded-full">
                                                <UserIcon className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                        )}
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