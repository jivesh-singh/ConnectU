import React, { useState } from 'react'
import {
  UserPlus,
  Check,
  Clock,
  MessageSquare,
  Sparkles,
  GraduationCap,
  MapPin,
  ChevronRight,
  Zap,
  Tag,
  Phone
} from 'lucide-react'
import { Card } from '../common/Card'
import { Avatar } from '../common/Avatar'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Modal } from '../common/Modal'
import { useStudentData } from '../../hooks/useStudentData'
import { useVoiceCall } from '../../hooks/useVoiceCall'
import { useNavigate } from 'react-router-dom'

export function StudentCard({ student, showScore = true, className = '', isProminent = false }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    withdrawFriendRequest,
    startChatWithStudent
  } = useStudentData()
  const { initiateCall } = useVoiceCall()
  const navigate = useNavigate()

  const handleMessage = async (e) => {
    e.stopPropagation()
    await startChatWithStudent(student)
    navigate('/messages')
  }

  const handleVoiceCall = (e) => {
    e?.stopPropagation()
    initiateCall(
      student.id,
      null,
      {
        id: student.id,
        fullName: student.fullName,
        avatar: student.avatar,
        branch: student.branch,
        university: student.university
      }
    )
  }

  const renderActionButton = (e) => {
    e?.stopPropagation()

    switch (student.status) {
      case 'accepted':
        return (
          <div className="flex items-center gap-1.5 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="outline"
              icon={Phone}
              onClick={handleVoiceCall}
              title={`Voice call with ${student.fullName}`}
              className="text-xs hover:border-[#292724] hover:bg-[#292724] hover:text-[#F5EBE0]"
            >
              Call
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={MessageSquare}
              onClick={handleMessage}
              className="text-xs"
            >
              Message
            </Button>
          </div>
        )
      case 'pending':
        return (
          <Button
            size="sm"
            variant="outline"
            icon={Clock}
            onClick={async (e) => {
              e.stopPropagation()
              try {
                await withdrawFriendRequest(student.id)
              } catch (err) {
                // Toast error surfaced by StudentDataContext
              }
            }}
            title="Click to cancel pending request"
            className="w-full sm:w-auto border-dashed hover:border-red-400 hover:text-red-700 text-xs"
          >
            Requested
          </Button>
        )
      case 'received':
        return (
          <div className="flex items-center gap-1.5 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="primary"
              icon={Check}
              onClick={async () => {
                try {
                  await acceptFriendRequest(student.id)
                } catch (err) {
                  // Toast error surfaced by StudentDataContext
                }
              }}
              className="text-xs"
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                try {
                  await rejectFriendRequest(student.id)
                } catch (err) {
                  // Toast error surfaced by StudentDataContext
                }
              }}
              className="text-xs text-cu-text-muted hover:text-red-700"
            >
              Decline
            </Button>
          </div>
        )
      default:
        return (
          <Button
            size="sm"
            variant="primary"
            icon={UserPlus}
            onClick={async (e) => {
              e.stopPropagation()
              try {
                await sendFriendRequest(student.id)
              } catch (err) {
                // Toast error surfaced by StudentDataContext
              }
            }}
            className="w-full sm:w-auto text-xs font-semibold shadow-xs"
          >
            Connect
          </Button>
        )
    }
  }

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={`glass-surface p-6 rounded-[22px] border border-white/70 shadow-glass flex flex-col justify-between group cursor-pointer transition-all duration-300 hover:translate-y-[-3px] hover:shadow-glass-md hover:border-white ${className}`}
      >
        <div className="space-y-4">
          
          {/* Header Row: Prominent Avatar, Info, Synergy Pill */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative flex-shrink-0">
                <Avatar
                  src={student.avatar}
                  name={student.fullName}
                  size={isProminent ? "xl" : "lg"}
                  isOnline={student.isOnline}
                  className="ring-2 ring-white/90 shadow-sm"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-cu-text-main group-hover:text-black transition-colors truncate">
                    {student.fullName}
                  </h4>
                </div>
                <p className="text-xs text-cu-text-muted flex items-center gap-1 mt-0.5 truncate font-medium">
                  <GraduationCap className="w-3.5 h-3.5 flex-shrink-0 text-cu-text-subtle" />
                  <span className="truncate">{student.branch}</span>
                </p>
                <p className="text-[11px] text-cu-text-subtle truncate">
                  {student.academicYear} • {student.university}
                </p>
              </div>
            </div>

            {/* Compatibility Indicator Capsule */}
            {showScore && student.compatibilityScore && (
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[rgba(213,189,175,0.35)] backdrop-blur-sm text-cu-text-main font-extrabold text-xs border border-cu-accent/80 shadow-xs">
                  <Sparkles className="w-3 h-3 text-[#A86832]" />
                  {student.compatibilityScore}%
                </span>
                <span className="text-[9px] text-cu-text-subtle mt-0.5 font-bold uppercase tracking-wider">
                  Synergy
                </span>
              </div>
            )}
          </div>

          {/* Bio Preview */}
          <p className="text-xs text-cu-text-muted leading-relaxed line-clamp-2">
            {student.bio}
          </p>

          {/* Complementary Synergy Highlight */}
          {student.compatibilityReasons && student.compatibilityReasons.length > 0 && (
            <div className="px-3 py-2 rounded-xl bg-white/60 border border-white/80 text-[11px] text-cu-text-main flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-cu-accent flex-shrink-0" />
              <span className="truncate font-medium">{student.compatibilityReasons[0]}</span>
            </div>
          )}

          {/* Skills and Interest Tags with Refined Pill Styling */}
          <div className="space-y-1.5 pt-1">
            <div className="flex flex-wrap gap-1.5">
              {(student.skills || []).slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-white/75 text-cu-text-main border border-white/85 shadow-2xs"
                >
                  {skill}
                </span>
              ))}
              {(student.skills || []).length > 3 && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-lg bg-[rgba(214,204,194,0.4)] text-cu-text-muted">
                  +{(student.skills || []).length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer: Action & Profile Trigger */}
        <div className="pt-3.5 mt-4 border-t border-[rgba(227,213,202,0.6)] flex items-center justify-between gap-2">
          <div className="flex items-center text-xs font-semibold text-cu-text-muted group-hover:text-cu-text-main transition-colors">
            <span>View Profile</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            {renderActionButton()}
          </div>
        </div>
      </div>

      {/* Detailed Student Profile Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="max-w-xl"
        title="Student Profile"
        subtitle={`${student.branch} • ${student.university}`}
      >
        <div className="space-y-6">
          {/* Header Profile Block */}
          <div className="flex items-center gap-4 bg-[rgba(245,235,224,0.7)] backdrop-blur-md p-4 rounded-2xl border border-white/70">
            <Avatar
              src={student.avatar}
              name={student.fullName}
              size="xl"
              isOnline={student.isOnline}
              className="ring-2 ring-white shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-cu-text-main truncate">{student.fullName}</h3>
                {student.compatibilityScore && (
                  <span className="px-2.5 py-1 rounded-xl bg-[rgba(213,189,175,0.4)] text-cu-text-main text-xs font-bold border border-cu-accent">
                    {student.compatibilityScore}% Compatibility
                  </span>
                )}
              </div>
              <p className="text-xs text-cu-text-muted mt-1 font-medium">
                {student.branch} • {student.academicYear}
              </p>
              <p className="text-xs text-cu-text-subtle flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-cu-text-subtle" />
                {student.college || student.university}
              </p>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-cu-text-subtle mb-1.5">
              About
            </h5>
            <p className="text-sm text-cu-text-main leading-relaxed bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-white/80">
              {student.bio}
            </p>
          </div>

          {/* Compatibility Breakdown */}
          {student.compatibilityReasons && student.compatibilityReasons.length > 0 && (
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-cu-text-subtle mb-2">
                Why You're Compatible
              </h5>
              <div className="space-y-2">
                {student.compatibilityReasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 text-xs text-cu-text-main bg-white/60 backdrop-blur-sm px-3.5 py-2.5 rounded-xl border border-white/80 font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cu-warning flex-shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-cu-text-subtle mb-2">
              Skills & Expertise
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {(student.skills || []).map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-white/80 border border-white text-xs font-medium text-cu-text-main"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-cu-text-subtle mb-2">
              Interests & Domains
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {(student.interests || []).map((interest) => (
                <span
                  key={interest}
                  className="px-2.5 py-1 rounded-lg bg-[rgba(214,204,194,0.45)] text-xs font-medium text-cu-text-main"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[rgba(227,213,202,0.6)] flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            {renderActionButton()}
          </div>
        </div>
      </Modal>
    </>
  )
}
