'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 2000)
    
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        if (session) {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Session check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        router.push('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="animate-pulse text-4xl">📄</div>
            </div>
          </div>
          <p className="mt-6 text-gray-700 font-semibold text-lg animate-pulse-slow">Loading Resume Parser...</p>
          <div className="mt-4 flex justify-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        <div className="bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-gray-200 hover:shadow-blue-500/20 transition-all duration-500">
          <div className="text-center mb-8">
            <div className="text-7xl mb-6 animate-float">📄</div>
            <h1 className="text-4xl font-bold text-blue-600 mb-3 animate-slideUp">
              Resume Parser
            </h1>
            <div className="mt-4 flex justify-center gap-3 animate-slideUp" style={{animationDelay: '0.1s'}}>
              <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Smart Matching</span>
              <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Fast</span>
              <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Accurate</span>
            </div>
          </div>

          <div className="animate-slideUp" style={{animationDelay: '0.2s'}}>
            <Auth
              supabaseClient={supabase}
              appearance={{ 
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#2563eb',
                      brandAccent: '#3b82f6',
                    },
                  },
                },
              }}
              providers={['google']}
              theme="light"
              redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
