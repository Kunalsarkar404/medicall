import Link from "next/link";

export default function Header() {
    return (
        <header className="w-full bg-green-500 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">
                    Medicall
                </Link>
                <nav className="space-x-4">
                    {isLoggedIn ? (
                        <>
                            <Link href="/book" className="hover:underline">
                                Book Appointment
                            </Link>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('token')
                                    window.location.reload()
                                }}
                                className="hover:underline"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/signup" className="hover:underline">
                                Signup
                            </Link>
                            <Link href="/login" className="hover:underline">
                                Login
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}