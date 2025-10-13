'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewChallengePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    goal: '',
    startDate: '',
    endDate: '',
    inviteEmail: '',
    invitePhone: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 提交挑战逻辑将在这里实现
    console.log('New challenge:', formData)
    // 临时重定向到挑战列表
    router.push('/challenges')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Create Wellness Challenge</h1>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>New Challenge</CardTitle>
            <CardDescription>
              Create a wellness challenge to motivate yourself and others
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Challenge Details</h3>
                
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Challenge Title
                  </label>
                  <Input
                    id="title"
                    placeholder="e.g., Walk 100 Miles in a Month"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="goal" className="text-sm font-medium">
                    Challenge Goal
                  </label>
                  <textarea
                    id="goal"
                    rows={3}
                    placeholder="Describe the goal and metrics for success..."
                    value={formData.goal}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="startDate" className="text-sm font-medium">
                      Start Date
                    </label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="endDate" className="text-sm font-medium">
                      End Date
                    </label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Invite Participants</h3>
                
                <div className="space-y-2">
                  <label htmlFor="inviteEmail" className="text-sm font-medium">
                    Invite by Email (Optional)
                  </label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    placeholder="participant@example.com"
                    value={formData.inviteEmail}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="invitePhone" className="text-sm font-medium">
                    Invite by Phone (Optional)
                  </label>
                  <Input
                    id="invitePhone"
                    type="tel"
                    placeholder="(123) 456-7890"
                    value={formData.invitePhone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Challenge
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}