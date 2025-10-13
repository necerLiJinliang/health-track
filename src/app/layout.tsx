import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HealthTrack - Personal Wellness Platform",
  description: "Track your health, manage appointments, and create wellness challenges",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navigation />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-gray-100 border-t border-gray-200 py-8">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>© 2023 HealthTrack Wellness Platform. All rights reserved.</p>
            <div className="mt-2 flex justify-center space-x-6">
              <a href="#" className="hover:text-blue-600">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600">Terms of Service</a>
              <a href="#" className="hover:text-blue-600">Contact Us</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
