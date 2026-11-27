import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../services/supabase'
import { studentService } from '../services/studentService'
import { INITIAL_USER_PROFILE } from '../services/mockData'

const AuthContext = createContext(null)

const AUTH_STORAGE_KEY = 'connectu_auth_state_v1'

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
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true)

  useEffect(() => {
    let mounted = true

    async function checkAuth() {
      try {
        if (isSupabaseConfigured) {
          // Fetch the current authenticated user using supabase.auth.getUser()
          const { data: { user: authUser }, error } = await supabase.auth.getUser()

          if (mounted && authUser) {
            const { data: sessionData } = await supabase.auth.getSession()
            setSession(sessionData?.session || null)

            // Load associated student profile record from public.profiles using authenticated user's UUID
            let profileData = null
            try {
              const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .maybeSingle()
              if (data) profileData = data
            } catch (profileErr) {
              console.warn('Profile read warning during auth check:', profileErr)
            }

            const formatted = formatSupabaseUser(authUser, profileData)
            setUser(formatted)
            setIsLoading(false)
            // Remove any stale demo session cache
            localStorage.removeItem(AUTH_STORAGE_KEY)
            localStorage.removeItem('connectu_current_user_v1')
            return
          } else if (mounted) {
            setSession(null)
          }
        }

        // Check if demo student session is explicitly active (only if isDemoStudent flag is set)
        const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
        if (savedAuth && mounted) {
          try {
            const parsed = JSON.parse(savedAuth)
            if (parsed.isAuthenticated && parsed.isDemoStudent && parsed.user) {
              setUser(parsed.user)
              setHasCompletedOnboarding(parsed.hasCompletedOnboarding ?? true)
              setIsLoading(false)
              return
            }
          } catch (e) {
            // ignore corrupted localStorage
          }
        }

        if (mounted) {
          setUser(null)
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        if (mounted) {
          setUser(null)
          setSession(null)
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    checkAuth()

    let authListener = null
    if (isSupabaseConfigured) {
      // Subscribe to authentication changes using supabase.auth.onAuthStateChange()
      const { data } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
        if (!mounted) return
        setSession(currentSession)

        if (currentSession?.user) {
          let profileData = null
          try {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .maybeSingle()
            if (data) profileData = data
          } catch (e) {
            console.warn('Profile read warning on auth state change:', e)
          }

          if (mounted) {
            setUser(formatSupabaseUser(currentSession.user, profileData))
            setIsLoading(false)
            localStorage.removeItem(AUTH_STORAGE_KEY)
            localStorage.removeItem('connectu_current_user_v1')
          }
        } else {
          // Signed-out state: clear all user identities and conversation storage
          if (mounted) {
            setUser(null)
            setSession(null)
            setIsLoading(false)
            localStorage.removeItem(AUTH_STORAGE_KEY)
            localStorage.removeItem('connectu_current_user_v1')
            localStorage.removeItem('connectu_conversations_v1')
          }
        }
      })
      authListener = data?.subscription
    }

    return () => {
      mounted = false
      if (authListener) authListener.unsubscribe()
    }
  }, [])

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
    setUser(demoUser)
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
    setUser(updated)
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
    setUser(null)
    setSession(null)
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
