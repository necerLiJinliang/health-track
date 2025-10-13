'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Challenge = {
  id: string
  title: string
  creator: string
  startDate: string
  endDate: string
  participants: number
  progress: number
  status: 'active' | 'completed' | 'upcoming'
}

export default function ChallengesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  // 示例数据
  const challenges: Challenge[] = [
    {
      id: 'CH-001',
      title: '10K Steps Daily',
      creator: 'Family Group',
      startDate: '2023-06-01',
      endDate: '2023-06-30',
      participants: 4,
      progress: 85,
      status: 'active'
    },
    {
      id: 'CH-002',
      title: 'Hydration Goal',
      creator: 'You',
      startDate: '2023-06-05',
      endDate: '2023-06-25',
      participants: 1,
      progress: 45,
      status: 'active'
    },
    {
      id: 'CH-003',
      title: 'Monthly Yoga Challenge',
      creator: 'Sarah Johnson',
      startDate: '2023-05-01',
      endDate: '2023-05-31',
      participants: 6,
      progress: 100,
      status: 'completed'
    },
    {
      id: 'CH-004',
      title: 'Healthy Eating',
      creator: 'Mike Chen',
      startDate: '2023-06-15',
      endDate: '2023-07-15',
      participants: 3,
      progress: 0,
      status: 'upcoming'
    }
  ]

  const filteredChallenges = challenges.filter(challenge => 
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.creator.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    <CardDescription>Created by {challenge.creator}</CardDescription>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    challenge.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : challenge.status === 'completed' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
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
                      {challenge.startDate} to {challenge.endDate}
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