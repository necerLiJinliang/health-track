'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Appointment = {
  id: string
  provider: string
  date: string
  time: string
  type: string
  status: 'upcoming' | 'completed' | 'cancelled'
}

export default function AppointmentsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  // 示例数据
  const appointments: Appointment[] = [
    {
      id: 'APT-001',
      provider: 'Dr. Sarah Johnson',
      date: '2023-06-10',
      time: '10:30 AM',
      type: 'Annual Checkup',
      status: 'upcoming'
    },
    {
      id: 'APT-002',
      provider: 'Dr. Michael Chen',
      date: '2023-06-12',
      time: '2:00 PM',
      type: 'Dermatology',
      status: 'upcoming'
    },
    {
      id: 'APT-003',
      provider: 'Dr. Emily Rodriguez',
      date: '2023-05-15',
      time: '9:00 AM',
      type: 'Follow-up',
      status: 'completed'
    },
    {
      id: 'APT-004',
      provider: 'Dr. James Wilson',
      date: '2023-05-01',
      time: '11:00 AM',
      type: 'Consultation',
      status: 'cancelled'
    }
  ]

  const filteredAppointments = appointments.filter(appointment => 
    appointment.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <Button onClick={() => router.push('/appointments/new')}>
              Book New Appointment
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex gap-4">
            <Input
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Button variant="outline">Filter</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredAppointments.map(appointment => (
            <Card key={appointment.id} className="shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{appointment.provider}</CardTitle>
                    <CardDescription>{appointment.type}</CardDescription>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'upcoming' 
                      ? 'bg-blue-100 text-blue-800' 
                      : appointment.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{appointment.date}</p>
                    <p className="text-gray-600">{appointment.time}</p>
                  </div>
                  <div className="flex gap-2">
                    {appointment.status === 'upcoming' && (
                      <>
                        <Button variant="outline" size="sm">Reschedule</Button>
                        <Button variant="destructive" size="sm">Cancel</Button>
                      </>
                    )}
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No appointments found matching your search.</p>
            <Button 
              className="mt-4" 
              onClick={() => router.push('/appointments/new')}
            >
              Book Your First Appointment
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}