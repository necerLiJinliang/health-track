'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Provider = {
  id: string
  name: string
  license: string
  specialty: string
  isPrimary: boolean
  isVerified: boolean
}

type Contact = {
  id: string
  type: 'email' | 'phone'
  value: string
  isVerified: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')

  // 示例数据
  const providers: Provider[] = [
    {
      id: 'PROV-001',
      name: 'Dr. Sarah Johnson',
      license: 'MD123456',
      specialty: 'General Practice',
      isPrimary: true,
      isVerified: true
    },
    {
      id: 'PROV-002',
      name: 'Dr. Michael Chen',
      license: 'MD789012',
      specialty: 'Dermatology',
      isPrimary: false,
      isVerified: true
    },
    {
      id: 'PROV-003',
      name: 'Dr. Emily Rodriguez',
      license: 'MD345678',
      specialty: 'Cardiology',
      isPrimary: false,
      isVerified: false
    }
  ]

  const contacts: Contact[] = [
    {
      id: 'CONT-001',
      type: 'email',
      value: 'john.doe@example.com',
      isVerified: true
    },
    {
      id: 'CONT-002',
      type: 'email',
      value: 'j.doe@work.com',
      isVerified: false
    },
    {
      id: 'CONT-003',
      type: 'phone',
      value: '(555) 123-4567',
      isVerified: true
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant={activeTab === 'profile' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('profile')}
                >
                  Personal Information
                </Button>
                <Button 
                  variant={activeTab === 'providers' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('providers')}
                >
                  Healthcare Providers
                </Button>
                <Button 
                  variant={activeTab === 'contacts' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('contacts')}
                >
                  Contact Information
                </Button>
                <Button 
                  variant={activeTab === 'family' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('family')}
                >
                  Family Group
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-3/4">
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and health information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Full Name
                        </label>
                        <Input
                          id="name"
                          defaultValue="John Doe"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="healthId" className="text-sm font-medium">
                          Health ID
                        </label>
                        <Input
                          id="healthId"
                          defaultValue="HT-123456789"
                          disabled
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="bio" className="text-sm font-medium">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        rows={3}
                        placeholder="Tell us about yourself..."
                        className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        defaultValue="Fitness enthusiast and health advocate"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'providers' && (
              <Card>
                <CardHeader>
                  <CardTitle>Healthcare Providers</CardTitle>
                  <CardDescription>
                    Manage your healthcare providers and set your primary care physician
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {providers.map(provider => (
                      <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{provider.name}</h3>
                          <p className="text-sm text-gray-600">{provider.specialty} • {provider.license}</p>
                          <div className="flex items-center mt-1">
                            {provider.isVerified ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending Verification
                              </span>
                            )}
                            {provider.isPrimary && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Primary Care Physician
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!provider.isPrimary && (
                            <Button variant="outline" size="sm">
                              Set as Primary
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-end">
                      <Button>
                        Add New Provider
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'contacts' && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Manage your contact details for appointment reminders and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contacts.map(contact => (
                      <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">
                            {contact.type === 'email' ? 'Email' : 'Phone'}
                          </h3>
                          <p className="text-gray-600">{contact.value}</p>
                          {contact.isVerified ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                              Unverified
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!contact.isVerified && (
                            <Button variant="outline" size="sm">
                              Verify
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-end">
                      <Button>
                        Add New Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'family' && (
              <Card>
                <CardHeader>
                  <CardTitle>Family Group</CardTitle>
                  <CardDescription>
                    Manage your family group and permissions for shared health management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium">Family Group Members</h3>
                      <p className="text-sm text-gray-600 mb-3">Manage who can access your health information</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">John Doe (You)</p>
                            <p className="text-sm text-gray-600">Group Owner</p>
                          </div>
                          <Button variant="outline" size="sm" disabled>
                            Owner
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Jane Doe</p>
                            <p className="text-sm text-gray-600">Spouse</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Manage Access
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Jimmy Doe</p>
                            <p className="text-sm text-gray-600">Child</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Manage Access
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button>
                        Invite Family Member
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}