'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createAppointment, getProviders } from '@/lib/api'
import { useLoadingManager } from '@/lib/loadingManager'
import { getErrorMessage } from '@/lib/apiErrorHandler'
import { Provider } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export default function NewAppointmentPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    providerLicense: '',
    providerEmail: '',
    date: '',
    time: '',
    type: 'in-person',
    notes: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loadingStates, { startLoading, stopLoading, isLoading }] = useLoadingManager()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 检查用户是否已登录
    if (!user) {
      setError('You must be logged in to create an appointment')
      return
    }
    
    // 验证表单数据
    if (!formData.providerLicense || !formData.date || !formData.time) {
      setError('Please fill in all required fields')
      return
    }
    
    try {
      startLoading('createAppointment')
      setError(null)
      
      // 构造预约数据
      const appointmentData = {
        appointment_id: `APT-${Date.now()}`, // 生成唯一的预约ID
        provider_id: parseInt(formData.providerLicense), // 这里应该通过许可证号查找提供者ID
        date_time: new Date(`${formData.date}T${formData.time}`).toISOString(),
        consultation_type: formData.type,
        notes: formData.notes || null
      }
      
      // 使用认证上下文中的用户ID
      const userId = user.id
      
      // 调用API创建预约
      await createAppointment(appointmentData, userId)
      
      // 重定向到预约列表页面
      router.push('/appointments')
    } catch (err: any) {
      console.error('Failed to create appointment:', err)
      setError(getErrorMessage(err))
    } finally {
      stopLoading('createAppointment')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Book New Appointment</h1>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Schedule Appointment</CardTitle>
            <CardDescription>
              Fill in the details below to book a new appointment with your healthcare provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                Error: {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Provider Information</h3>
                
                <div className="space-y-2">
                  <label htmlFor="providerLicense" className="text-sm font-medium">
                    Provider License Number
                  </label>
                  <Input
                    id="providerLicense"
                    placeholder="Enter provider license number"
                    value={formData.providerLicense}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="providerEmail" className="text-sm font-medium">
                    Provider Verified Email
                  </label>
                  <Input
                    id="providerEmail"
                    type="email"
                    placeholder="provider@example.com"
                    value={formData.providerEmail}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Appointment Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-medium">
                      Date
                    </label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="time" className="text-sm font-medium">
                      Time
                    </label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Consultation Type
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="in-person">In-Person</option>
                    <option value="virtual">Virtual/Online</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    placeholder="Describe symptoms or reason for visit..."
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading('createAppointment')}>
                  {isLoading('createAppointment') ? 'Booking...' : 'Book Appointment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}