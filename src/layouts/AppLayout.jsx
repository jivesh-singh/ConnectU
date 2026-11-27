import React from 'react'
import { Outlet, Link, Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/common/Sidebar'
import { BottomNav } from '../components/common/BottomNav'
import { Avatar } from '../components/common/Avatar'
import { useAuth } from '../hooks/useAuth'
import { VoiceCallProvider } from '../context/VoiceCallContext'
import { Sparkles, ExternalLink } from 'lucide-react'
import { getOAuthError } from '../utils/oauth'

export function AppLayout() {
  const { user, isSupabaseConfigured, isLoading } = useAuth()
  const location = useLocation()

  const userMeta = user?.user_metadata || {}
  const displayName =
    userMeta.full_name ||
    userMeta.name ||
    user?.full_name ||
    user?.fullName ||
    user?.name ||
    user?.email ||
    'Student'

  const avatarUrl =
    userMeta.avatar_url ||
    userMeta.picture ||
    user?.avatar_url ||
    user?.picture ||
    user?.avatar ||
    null

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cu-bg text-cu-text-main">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#292724] flex items-center justify-center text-[#F5EBE0] shadow-xs font-bold animate-pulse">
            <span className="text-sm">CU</span>
          </div>
          <p className="text-xs font-medium text-cu-text-muted">Loading workspace...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ oauthError: getOAuthError(location) }} />
  }

  return (
    <VoiceCallProvider>
      <div className="flex min-h-screen bg-cu-bg text-cu-text-main selection:bg-cu-accent selection:text-cu-text-main relative">
        
        {/* Subtle ambient blurred beige shapes behind app layout for realistic glass depth */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -left-24 w-[36rem] h-[36rem] rounded-full bg-[rgba(214,204,194,0.35)] blur-[70px]" />
          <div className="absolute top-1/3 -right-24 w-[32rem] h-[32rem] rounded-full bg-[rgba(245,235,224,0.65)] blur-[80px]" />
          <div className="absolute -bottom-24 left-1/3 w-[38rem] h-[38rem] rounded-full bg-[rgba(213,189,175,0.25)] blur-[85px]" />
        </div>

        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
          
          {/* Supabase Environment Notice (Glass Banner) */}
          {!isSupabaseConfigured && (
            <div className="bg-[rgba(245,235,224,0.7)] backdrop-blur-md border-b border-[rgba(255,255,255,0.6)] px-4 py-2 text-xs text-cu-text-muted flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-cu-warning animate-pulse" />
                <span className="font-semibold text-cu-text-main">Interactive Evaluation Mode:</span>
                <span className="truncate">Supabase credentials can be added to .env for live auth & DB sync.</span>
              </div>
              <Link
                to="/profile"
                className="text-[11px] font-semibold text-cu-text-main hover:underline flex items-center gap-1 flex-shrink-0 ml-2"
              >
                Config Info <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Mobile Top Header */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[rgba(245,235,224,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.6)] sticky top-0 z-30">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#292724] flex items-center justify-center text-[#F5EBE0] shadow-xs font-bold">
                <span className="text-sm">CU</span>
              </div>
              <span className="font-bold text-base text-cu-text-main">ConnectU</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/quiz" className="p-1.5 rounded-lg bg-[rgba(214,204,194,0.4)] text-cu-text-main">
                <Sparkles className="w-4 h-4 text-cu-accent" />
              </Link>
              <Link to="/profile">
                <Avatar
                  src={avatarUrl}
                  name={displayName}
                  size="sm"
                  isOnline={true}
                />
              </Link>
            </div>
          </header>

          {/* Page Content Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
            <Outlet />
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </VoiceCallProvider>
  )
}
