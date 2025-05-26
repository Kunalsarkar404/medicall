import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Medicall',
  description: 'Where the Vaidya Listens, and the Healing Begins.',
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body
        className="min-h-screen bg-background text-gray-900 antialiased"
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
