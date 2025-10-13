'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            HealthTrack Wellness Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Your personal health and wellness management platform. Track appointments, 
            create wellness challenges, and manage your healthcare providers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => router.push('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => router.push('/register')}
              className="px-8 py-3"
            >
              Create Account
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-600">Track Appointments</CardTitle>
              <CardDescription>Manage your healthcare appointments efficiently</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Schedule, view, and manage appointments with your healthcare providers. 
                Get reminders and keep track of your medical history.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-green-600">Wellness Challenges</CardTitle>
              <CardDescription>Create and join health challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Set fitness goals, create challenges with friends and family, 
                and track your progress together towards better health.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-purple-600">Health Reports</CardTitle>
              <CardDescription>Comprehensive health analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Generate monthly health reports, track your progress over time, 
                and gain insights into your wellness journey with detailed analytics.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose HealthTrack?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Personalized Care</h3>
              <p className="text-gray-600">Tailored health management for your unique needs</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Family Management</h3>
              <p className="text-gray-600">Manage health records for your entire family</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Provider Network</h3>
              <p className="text-gray-600">Connect with verified healthcare providers</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Data Security</h3>
              <p className="text-gray-600">Your health data is protected with industry-standard security</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
