'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getChallenges } from '@/lib/api'
import { useLoadingManager } from '@/lib/loadingManager'
import { getErrorMessage } from '@/lib/apiErrorHandler'
import { useAuth } from '@/contexts/AuthContext'

type Challenge = {
  id: number
  challenge_id: string
  creator_id: number
  goal: string
  start_date: string
  end_date: string
  created_at: string
  participants: any[]
  progress?: number
  status?: 'active' | 'completed' | 'upcoming'
}

export default function ChallengesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loadingStates, { startLoading, stopLoading, isLoading }] = useLoadingManager()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        startLoading('fetchChallenges')
        setError(null)
        const challengesData = await getChallenges()

        // 转换数据格式以匹配前端需求
        const formattedChallenges = challengesData.map((challenge: any) => ({
          ...challenge,
          id: challenge.id,
          title: challenge.goal,
          creator: 'You', // 这里应该从后端获取创建者信息
          startDate: new Date(challenge.start_date).toLocaleDateString(),
          endDate: new Date(challenge.end_date).toLocaleDateString(),
          participants: challenge.participants?.length || 1,
          progress: Math.floor(Math.random() * 100), // 临时随机进度，实际应该从后端获取
          status: 'active' // 临时状态，实际应该根据日期计算
        }))

        setChallenges(formattedChallenges)
      } catch (err: any) {
        console.error('Failed to fetch challenges:', err)
        setError(getErrorMessage(err))
      } finally {
        stopLoading('fetchChallenges')
      }
    }

    fetchChallenges()
  }, [])

  const filteredChallenges = challenges.filter(challenge =>
    challenge.goal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.creator_id.toString().includes(searchTerm.toLowerCase())
  )

  if (isLoading('fetchChallenges')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading challenges...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-4 bg-red-50 text-red-700 rounded-md max-w-md">
          <p>Error: {error}</p>
          <Button
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Wellness Challenges</h1>
            <Button onClick={() => router.push('/challenges/new')}>
              Create New Challenge
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex gap-4">
            <Input
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Button variant="outline">Filter</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map(challenge => (
            <Card key={challenge.id} className="shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{challenge.goal}</CardTitle>
                    <CardDescription>Created by {challenge.creator_id}</CardDescription>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${challenge.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : challenge.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {challenge.status?.charAt(0).toUpperCase() + (challenge.status?.slice(1) || '')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{challenge.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${challenge.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>
                      <span className="font-medium">{challenge.participants}</span> participants
                    </span>
                    <span>
                      {challenge.start_date} to {challenge.end_date}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    {challenge.status === 'active' && (
                      <Button size="sm" className="flex-1">
                        Update Progress
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No challenges found matching your search.</p>
            <Button
              className="mt-4"
              onClick={() => router.push('/challenges/new')}
            >
              Create Your First Challenge
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}