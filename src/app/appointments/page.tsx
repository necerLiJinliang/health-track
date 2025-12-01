'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getUserAppointments, getAssociatedProvider, getAllProvidersAvailableSlots } from '@/lib/api'
import { useLoadingManager } from '@/lib/loadingManager'
import { getErrorMessage } from '@/lib/apiErrorHandler'
import { useAuth } from '@/contexts/AuthContext'
import { Provider } from '@/types'
import { ProviderAvailabilityManager } from '@/components/ProviderAvailabilityManager'
import { ProviderAvailabilityModal } from '@/components/ProviderAvailabilityModal'

type Appointment = {
  id: number
  appointment_id: string
  provider_id: number
  date_time: string
  consultation_type: string
  notes: string | null
  cancelled: boolean
  cancellation_reason: string | null
  created_at: string
  user_id: number
  provider: {
    id: number
    license_number: string
    name: string
    specialty: string | null
    verified: boolean
    created_at: string
  }
}

export default function AppointmentsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [showAvailableSlots, setShowAvailableSlots] = useState(false)
  // 移除了selectedProvider状态，因为现在使用模态框方式
  const [error, setError] = useState<string | null>(null)
  const [loadingStates, { isLoading, startLoading, stopLoading }] = useLoadingManager()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // 获取关联的Providers
  const fetchProviders = async () => {
    try {
      startLoading("fetchProviders");
      // 使用认证上下文中的用户ID
      const userId = user?.id || 0;
      const data = await getAssociatedProvider(userId);
      // 转换数据格式以匹配前端组件
      const formattedProviders = data.map((provider: any) => ({
        id: provider.id,
        name: provider.name,
        license_number: provider.license_number,
        specialty: provider.specialty,
        verified: provider.verified,
      }));
      setProviders(formattedProviders);
    } catch (err: any) {
      console.error("Failed to fetch providers:", err);
      setError(getErrorMessage(err) || "Failed to load providers");
    } finally {
      stopLoading("fetchProviders");
    }
  };

  // 获取所有Providers的可用时间段
  const fetchAllProvidersAvailableSlots = async () => {
    try {
      startLoading("fetchAllSlots");
      const slots = await getAllProvidersAvailableSlots();
      setAvailableSlots(slots);
      setShowAvailableSlots(true);
    } catch (err: any) {
      console.error("Failed to fetch available slots:", err);
      setError(getErrorMessage(err) || "Failed to load available slots");
    } finally {
      stopLoading("fetchAllSlots");
    }
  };

  // 获取预约列表
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        startLoading('fetchAppointments')
        // 使用认证上下文中的用户ID
        const userId = user?.id || 0
        const data = await getUserAppointments(userId)
        setAppointments(data)
        setFilteredAppointments(data)
      } catch (err: any) {
        console.error('Failed to fetch appointments:', err)
        setError(getErrorMessage(err) || 'Failed to load appointments')
      } finally {
        stopLoading('fetchAppointments')
      }
    }

    if (isAuthenticated) {
      fetchAppointments()
      fetchProviders()
    }
  }, [isAuthenticated, user])

  // 根据搜索词过滤预约
  useEffect(() => {
    const filtered = appointments.filter(appointment => 
      appointment.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.consultation_type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredAppointments(filtered)
  }, [searchTerm, appointments])

  // 格式化日期时间显示
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  // 获取预约状态
  const getAppointmentStatus = (appointment: Appointment) => {
    if (appointment.cancelled) return 'cancelled'
    const appointmentDate = new Date(appointment.date_time)
    const now = new Date()
    return appointmentDate > now ? 'upcoming' : 'completed'
  }

  // 取消预约
  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      startLoading(`cancelAppointment-${appointmentId}`)
      // 这里应该调用取消预约的API
      // await cancelAppointment(appointmentId, "User requested cancellation")
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      // 更新本地状态以反映取消
      setAppointments(prev => prev.map(appt => 
        appt.id === appointmentId ? {...appt, cancelled: true} : appt
      ))
      setFilteredAppointments(prev => prev.map(appt => 
        appt.id === appointmentId ? {...appt, cancelled: true} : appt
      ))
      console.log(`Cancel appointment ${appointmentId}`)
    } catch (err: any) {
      console.error('Failed to cancel appointment:', err)
      setError(getErrorMessage(err) || 'Failed to cancel appointment')
    } finally {
      stopLoading(`cancelAppointment-${appointmentId}`)
    }
  }

  if (isLoading('fetchAppointments')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading appointments...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <Button onClick={fetchAllProvidersAvailableSlots}>
              Book New Appointment
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Providers Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Healthcare Providers</CardTitle>
              <CardDescription>
                Manage your healthcare providers and set availability schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading("fetchProviders") && <p>Loading providers...</p>}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  Error: {error}
                </div>
              )}
              <div className="space-y-4">
                {providers.length > 0 ? (
                  providers.map((provider) => (
                    <div 
                      key={provider.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{provider.name}</h3>
                        <p className="text-sm text-gray-600">
                          License: {provider.license_number}
                        </p>
                        {provider.specialty && (
                          <p className="text-sm text-gray-600">
                            Specialty: {provider.specialty}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <ProviderAvailabilityModal 
                          provider={provider} 
                          onAvailabilityUpdate={() => {
                            // 可以在这里添加任何需要在更新可用性时执行的逻辑
                          }}
                        >
                          <Button variant="outline" size="sm">
                            Manage Availability
                          </Button>
                        </ProviderAvailabilityModal>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      You haven't associated any healthcare providers yet.
                    </p>
                    <p className="text-gray-500 mt-2">
                      Please associate providers in your profile to manage their availability.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          
        </div>

        {/* Available Slots Section */}
        {showAvailableSlots && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Available Time Slots</CardTitle>
                <CardDescription>
                  Select a time slot to book your appointment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading("fetchAllSlots") && <p>Loading available slots...</p>}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    Error: {error}
                  </div>
                )}
                <div className="space-y-4">
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                      <div 
                        key={slot.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          // 跳转到预约页面，并传递选中的时间段信息
                          router.push(`/appointments/new?slotId=${slot.id}`);
                        }}
                      >
                        <div>
                          <h3 className="font-medium">
                            {providers.find(p => p.id === slot.provider_id)?.name || 'Unknown Provider'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(slot.start_time).toLocaleString()} - {new Date(slot.end_time).toLocaleString()}
                          </p>
                        </div>
                        <Button size="sm">
                          Book Appointment
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        No available time slots found.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Appointments Section */}
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
          {filteredAppointments.map(appointment => {
            const { date, time } = formatDateTime(appointment.date_time)
            const status = getAppointmentStatus(appointment)
            
            return (
              <Card key={appointment.id} className="shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{appointment.provider.name}</CardTitle>
                      <CardDescription>{appointment.consultation_type}</CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      status === 'upcoming' 
                        ? 'bg-blue-100 text-blue-800' 
                        : status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{date}</p>
                      <p className="text-gray-600">{time}</p>
                    </div>
                    <div className="flex gap-2">
                      {status === 'upcoming' && (
                        <>
                          <Button variant="outline" size="sm">Reschedule</Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleCancelAppointment(appointment.id)}
                            disabled={isLoading(`cancelAppointment-${appointment.id}`)}
                          >
                            {isLoading(`cancelAppointment-${appointment.id}`) ? 'Cancelling...' : 'Cancel'}
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
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