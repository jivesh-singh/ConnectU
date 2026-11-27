import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { supabase, isSupabaseConfigured } from '../services/supabase'
import { studentService } from '../services/studentService'
import { INITIAL_USER_PROFILE } from '../services/mockData'

const AuthContext = createContext(null)

const AUTH_STORAGE_KEY = 'connectu_auth_state_v1'

function readDemoSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))
    return saved?.isAuthenticated && saved.isDemoStudent && saved.user ? saved : null
  } catch {
    return null
  }
}

export function formatSupabaseUser(authUser, existingProfile = null) {
  if (!authUser) return null

  const metadata = authUser.user_metadata || {}

  // Resolve full_name or name from metadata, fallback to email
  const fullName =
    existingProfile?.full_name ||
    existingProfile?.fullName ||
    metadata.full_name ||
    metadata.name ||
    authUser.email ||
    'Student'

  // Resolve avatar_url or picture from metadata
  const avatar =
    existingProfile?.avatar_url ||
    existingProfile?.avatar ||
    metadata.avatar_url ||
    metadata.picture ||
    null

  const email = authUser.email || metadata.email || existingProfile?.email || ''

  return {
    ...existingProfile,
    ...authUser,
    id: authUser.id,
    email,
    user_metadata: metadata,
    fullName,
    full_name: fullName,
    name: metadata.name || metadata.full_name || fullName,
    avatar,
    avatar_url: avatar,
    picture: metadata.picture || metadata.avatar_url || avatar,
    university: existingProfile?.university || metadata.university || 'Stanford University',
    college: existingProfile?.college || metadata.college || 'School of Engineering',
    branch: existingProfile?.branch || metadata.branch || 'Computer Science',
    academicYear: existingProfile?.academic_year || existingProfile?.academicYear || '3rd Year',
    semester: existingProfile?.semester || '6th Semester',
    bio: existingProfile?.bio || metadata.bio || '',
    skills: existingProfile?.skills || ['React', 'TypeScript', 'Tailwind CSS', 'Python'],
    interests: existingProfile?.interests || existingProfile?.top_interests || ['Technology', 'AI and ML'],
    workingStyle: existingProfile?.working_style || existingProfile?.workingStyle || 'Technical Builder',
    profileCompletion: existingProfile?.profile_completion ?? existingProfile?.profileCompletion ?? 85,
    quizCompleted: Boolean(existingProfile?.quiz_completed ?? existingProfile?.quizCompleted),
    quizResult: existingProfile?.quizResult || (existingProfile?.working_style ? {
      workingStyle: existingProfile.working_style,
      topInterests: existingProfile.top_interests || [],
      secondaryInterests: existingProfile.secondary_interests || [],
      hobbies: existingProfile.hobbies || []
    } : null)
  }
}

export function AuthProvider({ children }) {
  const [demoUser, setDemoUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true)
  const authUserId = session?.user?.id

  useEffect(() => {
    function restoreDemoSession() {
      const saved = readDemoSession()
      setDemoUser(saved?.user ?? null)
      if (saved) setHasCompletedOnboarding(saved.hasCompletedOnboarding ?? true)
    }

    if (!isSupabaseConfigured) {
      restoreDemoSession()
      setIsLoading(false)
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession)
      setIsLoading(false)

      if (currentSession?.user) {
        setDemoUser(null)
        if (readDemoSession()) localStorage.removeItem('connectu_current_user_v1')
        localStorage.removeItem(AUTH_STORAGE_KEY)
      } else if (event === 'INITIAL_SESSION') {
        restoreDemoSession()
      } else if (event === 'SIGNED_OUT') {
        setDemoUser(null)
        setProfile(null)
        localStorage.removeItem(AUTH_STORAGE_KEY)
        localStorage.removeItem('connectu_current_user_v1')
        localStorage.removeItem('connectu_conversations_v1')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!authUserId) return

    let mounted = true

    async function loadProfile() {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', authUserId).maybeSingle()
        if (mounted && data) setProfile(current => current?.id === authUserId ? current : data)
      } catch (error) {
        console.warn('Could not load the signed-in student profile:', error)
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [authUserId])

  const authUser = session?.user
  const user = useMemo(() => authUser
    ? formatSupabaseUser(authUser, profile?.id === authUser.id ? profile : null)
    : demoUser, [authUser, profile, demoUser])

  // Google OAuth Login
  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not configured yet. To use live Google OAuth, provide your Supabase URL and Anon Key in .env. You can use the "Explore Demo Account" button below to test the full experience immediately.'
      )
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })

    if (error) throw error
  }

  // Demo Login (Instant evaluation)
  const loginAsDemoStudent = () => {
    const demoUser = INITIAL_USER_PROFILE
    setDemoUser(demoUser)
    setHasCompletedOnboarding(true)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      isAuthenticated: true,
      isDemoStudent: true,
      user: demoUser,
      hasCompletedOnboarding: true
    }))
    return demoUser
  }

  // Complete Onboarding Flow
  const completeOnboarding = async (profileData) => {
    const updated = await studentService.updateProfile({
      ...profileData,
      profileCompletion: 100
    })
    if (authUserId) setProfile(updated)
    else setDemoUser(updated)
    setHasCompletedOnboarding(true)
    return updated
  }

  // Logout
  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.warn('Supabase signOut error:', err)
      }
    }
    setDemoUser(null)
    setSession(null)
    setProfile(null)
    setHasCompletedOnboarding(false)
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem('connectu_current_user_v1')
    localStorage.removeItem('connectu_conversations_v1')
  }

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: Boolean(user),
    isSupabaseConfigured,
    hasCompletedOnboarding,
    loginWithGoogle,
    loginAsDemoStudent,
    completeOnboarding,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
