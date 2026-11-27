import React from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  Users,
  MessageSquare,
  User,
  LogOut,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useStudentData } from '../../hooks/useStudentData'
import { Avatar } from './Avatar'

export function Sidebar() {
  const { user, logout } = useAuth()
  const { incomingRequests, conversations } = useStudentData()
  const navigate = useNavigate()

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

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)
  const pendingRequestsCount = incomingRequests.length

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Discover', path: '/discover', icon: Compass },
    { name: 'Interest Quiz', path: '/quiz', icon: Sparkles, badge: 'AI' },
    { name: 'Network', path: '/network', icon: Users, count: pendingRequestsCount },
    { name: 'Messages', path: '/messages', icon: MessageSquare, count: totalUnread },
    { name: 'Profile & Settings', path: '/profile', icon: User },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <aside className="hidden md:flex flex-col w-56 lg:w-64 bg-[rgba(245,235,224,0.6)] backdrop-blur-[20px] border-r border-white/60 h-screen sticky top-0 flex-shrink-0 select-none shadow-glass transition-all">
      
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-[rgba(227,213,202,0.6)] flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[#292724] flex items-center justify-center text-[#F5EBE0] shadow-xs group-hover:scale-105 transition-transform font-extrabold">
            <span className="text-xs tracking-tight">CU</span>
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-[#292724] tracking-tight leading-none">ConnectU</h1>
            <p className="text-[9px] font-bold text-cu-text-subtle mt-0.5 uppercase tracking-wider">
              Student Network
            </p>
          </div>
        </Link>
      </div>

      {/* Nav Links with Refined Micro-Spacing and Distinct Active States */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[9px] font-extrabold uppercase tracking-widest text-cu-text-subtle px-3 py-1 mb-1">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-[#292724] text-[#F5EBE0] shadow-sm font-semibold'
                    : 'text-cu-text-muted hover:text-cu-text-main hover:bg-white/55'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors flex-shrink-0 ${
                        isActive ? 'text-[#D5BDAF]' : 'text-cu-text-subtle group-hover:text-cu-text-main'
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                  
                  {/* Count / Badge Indicators */}
                  <div className="flex items-center gap-1">
                    {item.count > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-[#D5BDAF] text-[#292724]'
                            : 'bg-[#292724] text-[#F5EBE0]'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                    {item.badge && !item.count && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-white/20 text-[#F5EBE0]'
                            : 'bg-[rgba(214,204,194,0.45)] text-cu-text-muted border border-white/60'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User Footer Profile & Quick Logout */}
      <div className="p-3 border-t border-[rgba(227,213,202,0.6)]">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/60 border border-white/70 shadow-xs">
          <Link to="/profile" className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90">
            <Avatar
              src={avatarUrl}
              name={displayName}
              size="sm"
              isOnline={true}
              className="ring-1 ring-white"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-cu-text-main truncate leading-tight">
                {displayName}
              </p>
              <p className="text-[10px] text-cu-text-muted truncate">
                {user?.branch || user?.email || 'Campus Member'}
              </p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-cu-text-muted hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            aria-label="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </aside>
  )
}
