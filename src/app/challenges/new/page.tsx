'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createChallenge } from '@/lib/api'
import { useLoadingManager } from '@/lib/loadingManager'
import { getErrorMessage } from '@/lib/apiErrorHandler'
import { useAuth } from '@/contexts/AuthContext'

export default function NewChallengePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [goal, setGoal] = useState('')
  const [participants, setParticipants] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loadingStates, { startLoading, stopLoading, isLoading }] = useLoadingManager()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 检查用户是否已登录
    if (!user) {
      setError('You must be logged in to create a challenge')
      return
    }
    
    // 基本验证
    if (!title || !startDate || !endDate || !goal) {
      setError('Please fill in all required fields')
      return
    }
    
    if (new Date(startDate) >= new Date(endDate)) {
      setError('End date must be after start date')
      return
    }
    
    try {
      startLoading('createChallenge')
      setError(null)
      
      // 构造挑战数据
      const challengeData = {
        challenge_id: `CH-${Date.now()}`, // 临时ID，实际应由后端生成
        goal: goal,
        start_date: startDate,
        end_date: endDate
      }
      
      // 调用API创建挑战，使用认证上下文中的用户ID
      const newChallenge = await createChallenge(challengeData, user.id)
      
      console.log('Challenge created:', newChallenge)
      router.push('/challenges')
    } catch (err: any) {
      console.error('Failed to create challenge:', err)
      setError(getErrorMessage(err))
    } finally {
      stopLoading('createChallenge')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Challenge</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Create Challenge</CardTitle>
              <CardDescription>Set up a new wellness challenge for you and your family</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="title">Challenge Title *</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g., 10K Steps Daily" 
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Describe your challenge..." 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input 
                    id="startDate" 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input 
                    id="endDate" 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Goal *</Label>
                <Input 
                  id="goal" 
                  value={goal} 
                  onChange={(e) => setGoal(e.target.value)} 
                  placeholder="e.g., Walk 10,000 steps daily" 
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="participants">Invite Participants</Label>
                <Input 
                  id="participants" 
                  value={participants} 
                  onChange={(e) => setParticipants(e.target.value)} 
                  placeholder="Enter email addresses separated by commas" 
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading('createChallenge')}>
                {isLoading('createChallenge') ? 'Creating...' : 'Create Challenge'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}