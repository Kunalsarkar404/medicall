import Image from "next/image";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function DoctorCard({ doctor, onBookNow }) {
    const profileSrc = doctor.profilePicture || "/default-doctor.png";

    return (
        <Card className="w-full max-w-sm">
            <CardContent>
                <div className="mt-2 flex justify-center mb-3">
                    <Image
                        src={profileSrc}
                        alt={doctor.name}
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-full object-cover"
                    />
                </div>

                <div className="text-left">
                    <CardHeader className="p-0">
                        <CardTitle>{doctor.name}</CardTitle>
                    </CardHeader>
                    <p className="text-sm text-gray-600">
                        Specialty: {doctor.specialty || "General"}
                    </p>
                </div>

                <Button className="mt-4 w-full" onClick={() => onBookNow?.(doctor)}>
                    Book Now
                </Button>
            </CardContent>
        </Card>

    );
}
