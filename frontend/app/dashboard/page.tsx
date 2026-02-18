'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface MatchResult {
  filename: string
  score: number
  matched_skills: string[]
  missing_skills: string[]
  extracted_data: any
}

interface Resume {
  id: string
  filename: string
  name: string
  email: string
  phone: string
  skills: string[]
  created_at: string
}

interface JobSearch {
  id: string
  job_title: string
  job_description: string
  keywords: string[]
  created_at: string
}

interface MatchHistory {
  id: string
  job_search_id: string
  resume_id: string
  match_score: number
  matched_skills: string[]
  missing_skills: string[]
  created_at: string
  job_search?: JobSearch
  resume?: Resume
}

interface DashboardStats {
  total_resumes: number
  total_job_searches: number
  total_matches: number
  average_match_score: number
  recent_activity: any[]
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [slowLoading, setSlowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('match')
  
  // Match Tab State
  const [jobDescription, setJobDescription] = useState('')
  const [keywords, setKeywords] = useState('')
  const [useKeywords, setUseKeywords] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [results, setResults] = useState<MatchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Resume Library State
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loadingResumes, setLoadingResumes] = useState(false)

  // History State
  const [jobSearches, setJobSearches] = useState<JobSearch[]>([])
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Analytics State
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        router.push('/')
      }
      setInitialLoading(false)
    })
  }, [router])

  useEffect(() => {
    if (user) {
      if (activeTab === 'resumes') {
        loadResumes()
      } else if (activeTab === 'history') {
        loadHistory()
      } else if (activeTab === 'analytics') {
        loadStats()
      }
    }
  }, [activeTab, user])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      alert('Failed to sign out. Please try again.')
    }
  }

  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ? `Bearer ${session.access_token}` : ''
  }

  // Match Functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleMatch = async () => {
    if (files.length === 0) {
      alert('Please upload at least one resume')
      return
    }

    if (!useKeywords && !jobDescription) {
      alert('Please enter a job description')
      return
    }

    if (useKeywords && !keywords) {
      alert('Please enter keywords')
      return
    }

    setLoading(true)
    setSlowLoading(false)
    setShowResults(false)
    
    // Show "slow loading" message only if request takes > 5 seconds
    const slowLoadingTimeout = setTimeout(() => {
      setSlowLoading(true)
    }, 5000)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const formData = new FormData()

      files.forEach(file => {
        formData.append('files', file)
      })

      const jobData = useKeywords 
        ? { keywords: keywords.split(',').map(k => k.trim()) }
        : { description: jobDescription }
      
      formData.append('job_input', JSON.stringify(jobData))

      const authHeader = await getAuthHeader()
      
      // Use the new match-and-save endpoint if user is logged in
      const endpoint = authHeader ? '/api/match-and-save' : '/api/match'
      
      // Create timeout controller (90 seconds for Render free tier cold start)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 90000)
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: authHeader ? {
          'Authorization': authHeader
        } : {},
        body: formData,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      const result = await response.json()
      
      if (Array.isArray(result)) {
        setResults(result)
      } else if (result.matches && Array.isArray(result.matches)) {
        setResults(result.matches)
      } else if (result.results && Array.isArray(result.results)) {
        setResults(result.results)
      } else {
        setResults([])
        console.error('Unexpected API response format:', result)
      }
      
      setShowResults(true)
      
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error: any) {
      console.error('Error matching resumes:', error)
      
      if (error.name === 'AbortError') {
        alert('Request timed out. The backend might be waking up (Render free tier). Please try again in 30 seconds.')
      } else if (error.message?.includes('Failed to fetch')) {
        alert('Cannot connect to backend. Please check your internet connection or try again in a moment.')
      } else {
        alert('Failed to match resumes. Error: ' + (error.message || 'Unknown error'))
      }
    } finally {
      clearTimeout(slowLoadingTimeout)
      setLoading(false)
      setSlowLoading(false)
    }
  }

  // Resume Library Functions
  const loadResumes = async () => {
    if (!user) return
    
    setLoadingResumes(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const authHeader = await getAuthHeader()
      
      // Create timeout controller (90 seconds for Render free tier cold start)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 90000)
      
      const response = await fetch(`${apiUrl}/api/resumes`, {
        headers: {
          'Authorization': authHeader
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }
      
      const data = await response.json()
      setResumes(data)
    } catch (error: any) {
      console.error('Error loading resumes:', error)
      
      if (error.name === 'AbortError') {
        alert('⏱️ Request timed out. The backend might be waking up from sleep (Render free tier cold start takes 30-60 seconds). Please click Refresh to try again.')
      } else if (error.message?.includes('Failed to fetch')) {
        alert('🔌 Cannot connect to backend. Please check your internet connection or the backend might be starting up. Try refreshing in a moment.')
      } else {
        alert('⚠️ Failed to load resumes. Error: ' + (error.message || 'Unknown error') + '\n\nTip: If you just deployed, the backend may be starting up. Try refreshing in 30 seconds.')
      }
    } finally {
      setLoadingResumes(false)
    }
  }

  const deleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const authHeader = await getAuthHeader()
      
      await fetch(`${apiUrl}/api/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader
        }
      })
      
      loadResumes()
    } catch (error) {
      console.error('Error deleting resume:', error)
      alert('Failed to delete resume')
    }
  }

  // History Functions
  const loadHistory = async () => {
    if (!user) return
    
    setLoadingHistory(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const authHeader = await getAuthHeader()
      
      // Create timeout controller (90 seconds for Render free tier cold start)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 90000)
      
      const [jobsRes, matchesRes] = await Promise.all([
        fetch(`${apiUrl}/api/job-searches`, {
          headers: { 'Authorization': authHeader },
          signal: controller.signal
        }),
        fetch(`${apiUrl}/api/matches`, {
          headers: { 'Authorization': authHeader },
          signal: controller.signal
        })
      ])
      
      clearTimeout(timeoutId)
      
      if (!jobsRes.ok || !matchesRes.ok) {
        throw new Error(`Server returned ${jobsRes.status} or ${matchesRes.status}`)
      }
      
      const jobs = await jobsRes.json()
      const matches = await matchesRes.json()
      
      setJobSearches(jobs)
      setMatchHistory(matches)
    } catch (error: any) {
      console.error('Error loading history:', error)
      
      if (error.name === 'AbortError') {
        alert('⏱️ Request timed out. The backend might be waking up from sleep (Render free tier cold start takes 30-60 seconds). Please click the History tab again to retry.')
      } else if (error.message?.includes('Failed to fetch')) {
        alert('🔌 Cannot connect to backend. Please check your internet connection or the backend might be starting up. Try refreshing in a moment.')
      } else {
        alert('⚠️ Failed to load match history. Error: ' + (error.message || 'Unknown error') + '\n\nTip: If you just deployed, the backend may be starting up. Try again in 30 seconds.')
      }
    } finally {
      setLoadingHistory(false)
    }
  }

  // Analytics Functions
  const loadStats = async () => {
    if (!user) return
    
    setLoadingStats(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const authHeader = await getAuthHeader()
      
      // Create timeout controller (90 seconds for Render free tier cold start)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 90000)
      
      const response = await fetch(`${apiUrl}/api/dashboard/stats`, {
        headers: {
          'Authorization': authHeader
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }
      
      const data = await response.json()
      setStats(data)
    } catch (error: any) {
      console.error('Error loading stats:', error)
      
      if (error.name === 'AbortError') {
        alert('⏱️ Request timed out. The backend might be waking up from sleep (Render free tier cold start takes 30-60 seconds). Please click Analytics tab again to retry.')
      } else if (error.message?.includes('Failed to fetch')) {
        alert('🔌 Cannot connect to backend. Please check your internet connection or the backend might be starting up. Try refreshing in a moment.')
      } else {
        alert('⚠️ Failed to load analytics. Error: ' + (error.message || 'Unknown error') + '\n\nTip: If you just deployed, the backend may be starting up. Try again in 30 seconds.')
      }
    } finally {
      setLoadingStats(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <h2 className="text-2xl font-bold text-blue-600 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-500">Please wait while we set up your session</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white backdrop-blur-xl shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl animate-float">📄</span>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">Resume Parser<span className="hidden sm:inline"> Dashboard</span></h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {user && (
              <span className="hidden md:flex text-xs sm:text-sm font-medium text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 rounded-full border border-blue-200">
                👤 {user.email}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="px-3 py-2 sm:px-5 sm:py-2.5 bg-red-600 text-white text-sm sm:text-base font-semibold rounded-xl hover:bg-red-700 hover:shadow-lg transition-all duration-300"
            >
              <span className="hidden sm:inline">🚪 </span>Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 md:mt-8">
        <div className="bg-white backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200">
          <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
            <button
              onClick={() => setActiveTab('match')}
              className={`px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                activeTab === 'match'
                  ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg sm:text-xl">🎯</span>
              <span className="hidden sm:inline">Match Resumes</span>
              <span className="sm:hidden">Match</span>
            </button>
            {user && (
              <>
                <button
                  onClick={() => setActiveTab('resumes')}
                  className={`px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                    activeTab === 'resumes'
                      ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg sm:text-xl">📚</span>
                  <span className="hidden sm:inline">Resume Library</span>
                  <span className="sm:hidden">Library</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                    activeTab === 'history'
                      ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg sm:text-xl">📋</span>
                  <span className="hidden sm:inline">Match History</span>
                  <span className="sm:hidden">History</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                    activeTab === 'analytics'
                      ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg sm:text-xl">📊</span>
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">Stats</span>
                </button>
              </>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 md:p-8">
            {/* Match Tab */}
            {activeTab === 'match' && (
              <div className="space-y-6 sm:space-y-8 animate-fadeIn">
                <div className="bg-blue-50 p-4 sm:p-6 rounded-2xl border border-blue-200">
                  <div className="flex gap-2 bg-gray-100 p-1 rounded-xl mb-4">
                    <button
                      onClick={() => setUseKeywords(false)}
                      className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 ${
                        !useKeywords
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Job Description
                    </button>
                    <button
                      onClick={() => setUseKeywords(true)}
                      className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 ${
                        useKeywords
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Keywords
                    </button>
                  </div>

                  {useKeywords ? (
                    <div className="mt-4">
                      <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3">
                        Keywords (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="e.g., Python, Machine Learning, API, React"
                        className="w-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-300 text-gray-700 font-medium"
                      />
                    </div>
                  ) : (
                    <div className="mt-4">
                      <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3">
                        📄 Job Description
                      </label>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={6}
                        placeholder="Paste job description here... We will extract relevant skills and requirements automatically."
                        className="w-full px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-300 text-gray-700 font-medium resize-none"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 p-4 sm:p-6 rounded-2xl border border-blue-200">
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3">
                    📎 Upload Resumes (PDF, DOC, DOCX)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="block w-full text-xs sm:text-sm text-gray-600 file:mr-4 file:py-2 sm:file:py-3 file:px-4 sm:file:px-6 file:rounded-xl file:border-0 file:text-xs sm:file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:scale-105 file:transition-all file:duration-300 file:cursor-pointer file:shadow-lg cursor-pointer"
                  />
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-2">
                        <span className="text-xl">📎</span>
                        {files.length} file(s) selected:
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-white p-3 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-lg">📄</span>
                              <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                                {file.name}
                              </span>
                              <span className="text-xs text-gray-500 shrink-0">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                              title="Remove file"
                            >
                              <span className="text-lg">✕</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleMatch}
                  disabled={loading}
                  className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white text-base sm:text-lg font-bold rounded-2xl hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-xl flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-t-2 border-b-2 border-white"></div>
                      <span>Analyzing Resumes...</span>
                    </>
                  ) : (
                    <>
                      <span>Match Resumes</span>
                    </>
                  )}
                </button>
                
                {slowLoading && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-5 text-sm text-yellow-900 shadow-lg animate-slideUp">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl animate-pulse">⏳</span>
                      <div>
                        <p className="font-bold text-base">This is taking longer than usual...</p>
                        <p className="text-xs mt-1 text-yellow-800">The backend might be waking up from sleep (free tier limitation). This can take up to 60 seconds on first load. ☕</p>
                      </div>
                    </div>
                  </div>
                )}

                {showResults && Array.isArray(results) && results.length > 0 && (
                  <div ref={resultsRef} className="mt-12 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-blue-200 animate-slideUp">
                    <div className="flex items-center gap-3 mb-8">
                      <span className="text-4xl">🎯</span>
                      <h2 className="text-3xl font-bold text-blue-600">Matching Results</h2>
                    </div>
                    
                    <div className="space-y-5">
                      {results.map((result, idx) => (
                        <div
                          key={idx}
                          className="fancy-card p-6 border-2 border-gray-100 hover:border-blue-300 transition-all duration-300 animate-fadeIn"
                          style={{animationDelay: `${idx * 0.1}s`}}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '📄'}</span>
                                <h3 className="font-bold text-xl text-gray-800">{result.filename}</h3>
                              </div>
                              <p className="text-sm font-semibold text-blue-600">
                                Rank: #{idx + 1}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`text-5xl font-bold ${
                                result.score >= 70 ? 'text-green-600' :
                                result.score >= 40 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {result.score}%
                              </div>
                              <p className="text-xs text-gray-600 font-semibold mt-2">Match Score</p>
                              <div className="mt-2">
                                {result.score >= 70 && <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">Excellent Match ✨</span>}
                                {result.score >= 40 && result.score < 70 && <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">Good Match 👍</span>}
                                {result.score < 40 && <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">Weak Match ⚠️</span>}
                              </div>
                            </div>
                          </div>

                          {Array.isArray(result.matched_skills) && result.matched_skills.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                                <span>✅</span> Matched Skills:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {result.matched_skills.map((skill, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {result.extracted_data?.email && (
                            <p className="text-sm text-gray-700 mt-3 font-medium flex items-center gap-2">
                              <span className="text-lg">📧</span> {result.extracted_data.email}
                            </p>
                          )}

                          {result.extracted_data?.phone && (
                            <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
                              <span className="text-lg">📞</span> {result.extracted_data.phone}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Resume Library Tab */}
            {activeTab === 'resumes' && (
              <div className="animate-fadeIn">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📚</span>
                    <h2 className="text-3xl font-bold text-blue-600">Resume Library</h2>
                  </div>
                  <button
                    onClick={loadResumes}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-xl transition-all duration-300"
                  >
                    Refresh
                  </button>
                </div>

                {loadingResumes ? (
                  <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading resumes...</p>
                  </div>
                ) : !Array.isArray(resumes) || resumes.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No resumes saved yet. Upload resumes in the Match tab to save them.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {resumes.map((resume) => (
                      <div key={resume.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{resume.filename}</h3>
                            {resume.name && <p className="text-gray-700 mt-1">Name: {resume.name}</p>}
                            {resume.email && <p className="text-gray-600 text-sm">Email: {resume.email}</p>}
                            {resume.phone && <p className="text-gray-600 text-sm">Phone: {resume.phone}</p>}
                            
                            {Array.isArray(resume.skills) && resume.skills.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                                <div className="flex flex-wrap gap-2">
                                  {resume.skills.map((skill, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-500 mt-3">
                              Uploaded: {new Date(resume.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => deleteResume(resume.id)}
                            className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Match History</h2>
                  <button
                    onClick={loadHistory}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-xl transition-all duration-300"
                  >
                    Refresh
                  </button>
                </div>

                {loadingHistory ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading history...</p>
                  </div>
                ) : matchHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No match history yet. Start matching resumes to see history.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Array.isArray(jobSearches) && jobSearches.map((job) => {
                      const jobMatches = Array.isArray(matchHistory) ? matchHistory.filter(m => m.job_search_id === job.id) : []
                      if (jobMatches.length === 0) return null
                      
                      return (
                        <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {job.job_title || 'Job Search'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {new Date(job.created_at).toLocaleString()}
                          </p>
                          
                          <div className="space-y-3">
                            {jobMatches.map((match) => (
                              <div key={match.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-900">Resume Match</span>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    match.match_score >= 70 ? 'bg-green-100 text-green-800' :
                                    match.match_score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {match.match_score}% Match
                                  </span>
                                </div>
                                
                                <div className="mt-3 grid md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Matched Skills:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {Array.isArray(match.matched_skills) && match.matched_skills.map((skill, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {Array.isArray(match.missing_skills) && match.missing_skills.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-700 mb-1">Missing Skills:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {match.missing_skills.map((skill, idx) => (
                                          <span key={idx} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                  <button
                    onClick={loadStats}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-xl transition-all duration-300"
                  >
                    Refresh
                  </button>
                </div>

                {loadingStats ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading statistics...</p>
                  </div>
                ) : stats ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Total Resumes</h3>
                      <p className="text-3xl font-bold text-blue-600">{stats.total_resumes}</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Job Searches</h3>
                      <p className="text-3xl font-bold text-blue-600">{stats.total_job_searches}</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Total Matches</h3>
                      <p className="text-3xl font-bold text-blue-600">{stats.total_matches}</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Match Score</h3>
                      <p className="text-3xl font-bold text-blue-600">
                        {stats.average_match_score ? `${stats.average_match_score.toFixed(1)}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No analytics data available yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


