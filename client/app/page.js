"use client"
import DoctorCard from "@/components/DoctorCard";
import { Button } from "@/components/ui/button";
import { getDoctors } from "@/lib/api";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gradient-to-b from-background to-green-300">
      <section className="py-16 text-center md:text-left md:flex md:items-center md:justify-between gap-10">
        <div>
          <h1 className="text-4xl font-bold text-green-600">Welcome to Medicall</h1>
          <p className="mt-4 text-lg text-gray-600">
            Jab zarurat ho, hum saath hain.
          </p>
          <Button className="mt-6 bg-green-500">Find a Doctor</Button>
        </div>
        <Image
          src="/doctor.png"
          alt="Medicall"
          width={400}
          height={400}
          className="mx-auto mt-10 md:mt-0"
        />
      </section>

      <section className="container mx-auto py-8">
        <h2 className="text-3xl font-semibold text-primary mb-6">
          Our Doctors
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
              <DoctorCard key={index} doctor={doctor} />
            ))}
          </div>
        )}
      </section>

    </main>
  );
}
