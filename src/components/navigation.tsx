'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              onClick={() => router.push('/')}
              className="text-xl font-bold text-blue-600"
            >
              HealthTrack
            </button>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => router.push('/dashboard')}
              className={`${
                pathname === '/dashboard' 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => router.push('/appointments')}
              className={`${
                pathname === '/appointments' || pathname.startsWith('/appointments/')
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Appointments
            </button>
            <button 
              onClick={() => router.push('/challenges')}
              className={`${
                pathname === '/challenges' || pathname.startsWith('/challenges/')
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Challenges
            </button>
            <button 
              onClick={() => router.push('/profile')}
              className={`${
                pathname === '/profile' 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Profile
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {pathname !== '/login' && pathname !== '/register' ? (
              <>
                <Button variant="ghost" onClick={() => router.push('/login')}>
                  Sign In
                </Button>
                <Button onClick={() => router.push('/register')}>
                  Sign Up
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => router.push('/')}>
                Home
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}