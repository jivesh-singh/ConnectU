import React from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Users,
  Compass,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Brain,
  Zap,
  ArrowRight,
  Clock,
  Check,
  X
} from 'lucide-react'
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Avatar } from '../components/common/Avatar'
import { StudentCard } from '../components/cards/StudentCard'
import { CollaborationCard } from '../components/cards/CollaborationCard'
import { useStudentData } from '../hooks/useStudentData'
import { useAuth } from '../hooks/useAuth'

export function DashboardPage() {
  const { user } = useAuth()
  const {
    students,
    incomingRequests,
    collaborations,
    conversations,
    acceptFriendRequest,
    rejectFriendRequest
  } = useStudentData()

  // Top matches based on real compatibility algorithm
  const topMatches = [...students]
    .sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0))
    .slice(0, 3)

  const profileCompletion = user?.profileCompletion || 85

  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const userMeta = user?.user_metadata || {}
  const displayName =
    userMeta.full_name ||
    userMeta.name ||
    user?.full_name ||
    user?.fullName ||
    user?.name ||
    user?.email ||
    'Student'

  return (
    <div className="space-y-8 pb-14">
      
      {/* 1. ART-DIRECTED WELCOME HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[rgba(227,213,202,0.6)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/70 border border-white/80 text-cu-text-main">
              Campus Workspace
            </span>
            <span className="text-xs text-cu-text-subtle font-medium">
              Spring 2026 Cohort
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292724] tracking-tight">
            {timeGreeting}, {displayName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-cu-text-muted font-medium">
            {user?.branch || 'Computer Science'} • {user?.university || 'Stanford University'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/discover">
            <Button variant="primary" size="sm" icon={Compass} className="shadow-xs">
              Find Teammates
            </Button>
          </Link>
          <Link to="/quiz">
            <Button variant="glass" size="sm" icon={Sparkles} className="border-white/80">
              Calibrate Quiz
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. PROFILE READINESS HERO CARD (Visual Refinement) */}
      <div className="glass-surface-elevated p-6 sm:p-7 rounded-[24px] shadow-glass-md border border-white/85">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex items-start sm:items-center gap-5 min-w-0">
            {/* Visual Circular/Pill Score Indicator */}
            <div className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#292724] text-[#F5EBE0] flex flex-col items-center justify-center shadow-md">
              <span className="text-xl sm:text-2xl font-extrabold leading-none">{profileCompletion}%</span>
              <span className="text-[9px] font-bold text-[#D5BDAF] uppercase tracking-wider mt-1">Ready</span>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[rgba(213,189,175,0.4)] text-cu-text-main border border-cu-accent">
                  {profileCompletion === 100 ? 'Fully Calibrated' : 'Calibration in Progress'}
                </span>
                <span className="text-xs text-cu-text-subtle font-medium">
                  {user?.quizResult?.workingStyle || user?.quizResult?.archetype || 'Technical Builder'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-cu-text-main leading-snug">
                {profileCompletion === 100
                  ? 'Your profile is actively analyzed for high-synergy co-founders'
                  : 'Calibrate your archetype to unlock 95%+ precision peer matches'}
              </h3>
              <p className="text-xs text-cu-text-muted leading-relaxed max-w-xl">
                Complementary algorithms use your answers to pair React builders with PyTorch vision researchers and design leads.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {profileCompletion < 100 ? (
              <Link to="/quiz">
                <Button variant="primary" size="md" icon={Sparkles} className="shadow-sm">
                  Complete Quiz (+15%)
                </Button>
              </Link>
            ) : (
              <Link to="/profile">
                <Button variant="secondary" size="sm">
                  Edit Preferences
                </Button>
              </Link>
            )}
          </div>

        </div>

        {/* Progress Track */}
        <div className="w-full h-2 bg-[rgba(214,204,194,0.4)] rounded-full overflow-hidden mt-5">
          <div
            className="h-full bg-[#292724] transition-all duration-700 rounded-full"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
      </div>

      {/* 3. PENDING REQUESTS (Compact, Elegant Layout) */}
      {incomingRequests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cu-text-subtle" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-cu-text-main">
                Pending Peer Requests ({incomingRequests.length})
              </h2>
            </div>
            <Link to="/network" className="text-xs font-semibold text-cu-text-main hover:underline flex items-center gap-0.5">
              Manage All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {incomingRequests.map(req => (
              <div
                key={req.id}
                className="glass-surface p-3.5 rounded-2xl border border-white/75 flex items-center justify-between gap-3 shadow-xs hover:border-white transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar src={req.avatar} name={req.fullName} size="sm" isOnline={req.isOnline} />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-cu-text-main truncate">{req.fullName}</h4>
                    <p className="text-[10px] text-cu-text-muted truncate">{req.branch}</p>
                    <span className="text-[10px] font-bold text-cu-success">
                      {req.compatibilityScore}% Match
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => acceptFriendRequest(req.id)}
                    className="p-1.5 rounded-lg bg-[#292724] text-[#F5EBE0] hover:bg-black transition-colors"
                    title="Accept"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(req.id)}
                    className="p-1.5 rounded-lg bg-white/70 text-cu-text-muted hover:text-red-700 hover:bg-white transition-colors"
                    title="Decline"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. RECOMMENDED CONNECTIONS — THE MAIN VISUAL FOCUS */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cu-accent" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#292724] tracking-tight">
                Recommended Connections
              </h2>
            </div>
            <p className="text-xs text-cu-text-muted mt-0.5">
              Ranked dynamically by interest synergy, cognitive working style, and complementary technical skills.
            </p>
          </div>
          <Link to="/discover">
            <Button variant="secondary" size="sm" icon={Compass}>
              View All ({students.length})
            </Button>
          </Link>
        </div>

        {/* 3-Card Grid with Rich Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topMatches.map((student, idx) => (
            <StudentCard
              key={student.id}
              student={student}
              isProminent={idx === 0}
            />
          ))}
        </div>
      </div>

      {/* 5. ACTIVE COLLABORATIONS & RECENT CONVERSATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        
        {/* Left: Active Campus Collaborations (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#292724] tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cu-text-subtle" />
                Active Campus Collaborations
              </h2>
              <p className="text-xs text-cu-text-muted mt-0.5">
                Collegiate squads seeking co-founders, frontend builders, and researchers.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {collaborations.slice(0, 2).map(collab => (
              <CollaborationCard key={collab.id} opportunity={collab} />
            ))}
          </div>
        </div>

        {/* Right: Recent Conversations & Shared Interests (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Recent Conversations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cu-text-main flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cu-text-subtle" />
                Recent Conversations
              </h3>
              <Link to="/messages" className="text-xs font-semibold text-cu-text-main hover:underline">
                Open Chat
              </Link>
            </div>

            <div className="glass-surface p-0 overflow-hidden divide-y divide-[rgba(227,213,202,0.6)] rounded-2xl border border-white/70 shadow-xs">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-cu-text-muted">
                  No active conversations yet. Reach out to a peer to start!
                </div>
              ) : (
                conversations.slice(0, 3).map(conv => (
                  <Link
                    key={conv.id}
                    to="/messages"
                    className="p-3.5 flex items-start gap-3 hover:bg-white/50 transition-colors block"
                  >
                    <Avatar
                      src={conv.participantAvatar}
                      name={conv.participantName}
                      size="md"
                      isOnline={conv.isOnline}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-cu-text-main truncate">
                          {conv.participantName}
                        </h4>
                        <span className="text-[10px] text-cu-text-subtle">
                          {conv.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-xs text-cu-text-muted truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#292724] flex-shrink-0 mt-1" />
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Shared Interests Cloud */}
          <div className="glass-surface p-5 space-y-3 rounded-2xl border border-white/70 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cu-text-subtle">
                Your Shared Interest Cloud
              </h4>
              <Link to="/profile" className="text-[11px] font-semibold text-cu-text-main hover:underline">
                Edit
              </Link>
            </div>
            <p className="text-xs text-cu-text-muted">
              These topics represent your strongest synergy drivers across the network.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(user?.interests || ['Technology', 'AI and ML', 'Design', 'Entrepreneurship']).map(interest => (
                <span
                  key={interest}
                  className="px-2.5 py-1 rounded-lg bg-white/75 text-xs font-semibold text-cu-text-main border border-white/80 shadow-2xs"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
