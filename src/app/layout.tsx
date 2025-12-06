import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/navigation";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "HealthTrack - Personal Wellness Platform",
  description:
    "Track your health, manage appointments, and create wellness challenges",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased min-h-screen flex flex-col"
      >
        <AuthProvider>
          <Navigation />
          <main className="flex-grow">{children}</main>
        </AuthProvider>
        <footer className="bg-gray-100 border-t border-gray-200 py-8">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>© 2025 HealthTrack Wellness Platform. All rights reserved.</p>
            <div className="mt-2 flex justify-center space-x-6">
              <a href="#" className="hover:text-blue-600">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-blue-600">
                Terms of Service
              </a>
              <a href="#" className="hover:text-blue-600">
                Contact Us
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
