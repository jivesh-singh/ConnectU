import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Compass, Sparkles, Users, MessageSquare, User } from 'lucide-react'
import { useStudentData } from '../../hooks/useStudentData'

export function BottomNav() {
  const { incomingRequests, conversations } = useStudentData()
  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)
  const pendingCount = incomingRequests.length

  const items = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Discover', path: '/discover', icon: Compass },
    { name: 'Quiz', path: '/quiz', icon: Sparkles },
    { name: 'Network', path: '/network', icon: Users, count: pendingCount },
    { name: 'Chat', path: '/messages', icon: MessageSquare, count: totalUnread },
    { name: 'Profile', path: '/profile', icon: User },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[rgba(245,235,224,0.88)] backdrop-blur-xl border-t border-[rgba(255,255,255,0.65)] px-2 py-1.5 flex items-center justify-around safe-area-bottom shadow-glass-lg">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-[#292724] font-bold' : 'text-cu-text-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {item.count > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#292724] text-[#F5EBE0] text-[9px] font-bold px-1 rounded-full">
                      {item.count}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.name}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-[#292724] mt-0.5" />
                )}
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
