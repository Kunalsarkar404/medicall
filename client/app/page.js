"use client"
import BookingModal from "@/components/BookingModal";
import DoctorCard from "@/components/DoctorCard";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { getDoctors } from "@/lib/api";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setUser({ id: decoded.id, name: decoded.name || 'User' })
      } catch (error) {
        console.error('Invalid token:', err)
      }
    }

    const fetchDoctors = async () => {
      try {
        const { data } = await getDoctors()
        setDoctors(data)
      } catch (error) {
        console.log('Error fetching doctors:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDoctors()
  }, [])

  const handleBookNow = (doctor) => {
    setSelectedDoctor(doctor)
    setIsModalOpen(true)
  }

  return (
    <div>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">

        <section className="py-1 text-center md:text-left md:flex md:items-center md:justify-between gap-10">
          <div>
            <h1 className="text-5xl font-bold text-green-700">Welcome to Rakshaya</h1>
            <p className="mt-4 text-2xl text-gray-600">
              Jab zarurat ho, hum saath hain.
            </p>
            <div className="space-x-2">
              <Button className="mt-6 bg-green-700">Find Doctors</Button>
              <Button className="mt-6 bg-green-700">Video Consult</Button>
            </div>
          </div>
          <Image
            src="/doctor.png"
            alt="Medicall"
            width={200}
            height={200}
            className="mx-auto mt-10 md:mt-0"
          />
        </section>

        <section className="container mx-auto py-8">
          <h2 className="text-3xl font-semibold text-primary mb-6">
            Find and book your doctor
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white shadow rounded p-6 h-64" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor, index) => (
                <DoctorCard key={index} doctor={doctor} onBookNow={handleBookNow} />
              ))}
            </div>
          )}
        </section>
        {selectedDoctor && (
          <BookingModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            doctor={selectedDoctor}
            user={user}
          />
        )}
      </main>
    </div>

  );
}
