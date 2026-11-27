import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  Compass,
  Check,
  X
} from 'lucide-react'
import { Card } from '../components/common/Card'
import { Avatar } from '../components/common/Avatar'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { StudentCard } from '../components/cards/StudentCard'
import { useStudentData } from '../hooks/useStudentData'

export function NetworkPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('friends') // 'friends' | 'incoming' | 'sent'
  const {
    friends,
    incomingRequests,
    sentRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    withdrawFriendRequest,
    isLoading
  } = useStudentData()

  const tabs = [
    { id: 'friends', label: 'My Connections', count: friends.length, icon: UserCheck },
    { id: 'incoming', label: 'Incoming Requests', count: incomingRequests.length, icon: UserPlus },
    { id: 'sent', label: 'Sent Requests', count: sentRequests.length, icon: Clock },
  ]

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cu-text-subtle">
            Campus Connections
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292724] tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-[#292724]" />
            My Network
          </h1>
          <p className="text-sm text-cu-text-muted mt-0.5">
            Manage your student connections, pending requests, and collaborator network.
          </p>
        </div>

        <Link to="/discover">
          <Button variant="primary" size="sm" icon={Compass}>
            Discover More Peers
          </Button>
        </Link>
      </div>

      {/* Tabs Navigation (Glass segmented bar) */}
      <div className="flex items-center gap-2 border-b border-[rgba(227,213,202,0.6)] pb-2 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#292724] text-[#F5EBE0] shadow-sm font-semibold'
                  : 'text-cu-text-muted hover:text-cu-text-main hover:bg-[rgba(255,255,255,0.45)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-[#D5BDAF] text-[#292724] font-bold'
                    : 'bg-[rgba(214,204,194,0.45)] text-cu-text-main'
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: MY CONNECTIONS */}
      {activeTab === 'friends' && (
        <div className="space-y-6">
          {friends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {friends.map(friend => (
                <StudentCard key={friend.id} student={friend} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No connections yet"
              description="Start building your network by exploring recommended peers or taking the interest quiz."
              actionLabel="Explore Recommended Students"
              onAction={() => navigate('/discover')}
            />
          )}
        </div>
      )}

      {/* TAB 2: INCOMING REQUESTS */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          {incomingRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests.map(req => (
                <div key={req.id} className="glass-surface-elevated p-5 rounded-[22px] border border-white/80 shadow-glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Avatar src={req.avatar} name={req.fullName} size="lg" isOnline={req.isOnline} className="ring-2 ring-white/90 shadow-sm" />
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-cu-text-main truncate leading-tight">
                        {req.fullName}
                      </h4>
                      <p className="text-xs text-cu-text-muted mt-0.5 truncate">
                        {req.branch} • {req.university}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[rgba(213,189,175,0.4)] text-cu-text-main border border-cu-accent">
                          {req.compatibilityScore}% Match
                        </span>
                        <span className="text-[11px] text-cu-text-subtle">
                          {req.academicYear}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Check}
                      onClick={async () => {
                        try {
                          await acceptFriendRequest(req.id)
                        } catch (err) {
                          // Handled via toast
                        }
                      }}
                      className="flex-1 sm:flex-none"
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={X}
                      onClick={async () => {
                        try {
                          await rejectFriendRequest(req.id)
                        } catch (err) {
                          // Handled via toast
                        }
                      }}
                      className="flex-1 sm:flex-none"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={UserPlus}
              title="No incoming requests right now"
              description="When other students find your profile in Discover or campus huddles, their requests will appear here."
            />
          )}
        </div>
      )}

      {/* TAB 3: SENT REQUESTS */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          {sentRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sentRequests.map(sent => (
                <div key={sent.id} className="glass-surface p-5 rounded-[22px] border border-white/70 shadow-glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Avatar src={sent.avatar} name={sent.fullName} size="lg" isOnline={sent.isOnline} className="ring-2 ring-white/90 shadow-sm" />
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-cu-text-main truncate leading-tight">
                        {sent.fullName}
                      </h4>
                      <p className="text-xs text-cu-text-muted mt-0.5 truncate">
                        {sent.branch} • {sent.university}
                      </p>
                      <span className="text-[11px] text-cu-text-subtle inline-block mt-1">
                        Request pending approval
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await withdrawFriendRequest(sent.id)
                      } catch (err) {
                        // Handled via toast
                      }
                    }}
                    className="w-full sm:w-auto hover:text-red-700 hover:border-red-300"
                  >
                    Cancel Request
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="No pending requests sent"
              description="You have no outstanding connection invitations. Jump into Discover to find peers."
            />
          )}
        </div>
      )}

    </div>
  )
}
