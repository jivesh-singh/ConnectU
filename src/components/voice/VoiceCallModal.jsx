import React, { useEffect } from 'react'
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  AlertCircle,
  Radio,
  Clock,
  Sparkles,
  ShieldCheck,
  X
} from 'lucide-react'
import { Avatar } from '../common/Avatar'

/**
 * VoiceCallModal Component
 * 
 * Reusable modal for 1-to-1 WebRTC voice calling in ConnectU.
 * Supports incoming ringing, outgoing calling, connecting handshake,
 * active connected voice room with timer & mute toggle, and error states.
 * 
 * Consistent with ConnectU's cream, beige, and espresso glassmorphic aesthetic.
 */
export function VoiceCallModal({
  isOpen,
  callState,
  peerInfo,
  formattedDuration,
  callDuration = 0,
  isMuted = false,
  errorMessage = null,
  onAccept,
  onDecline,
  onEnd,
  onToggleMute,
  onClose
}) {
  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || callState === 'idle') {
    return null
  }

  const peerName = peerInfo?.fullName || peerInfo?.full_name || peerInfo?.name || 'Student Peer'
  const peerAvatar = peerInfo?.avatar || peerInfo?.avatar_url || peerInfo?.picture || null
  const peerBranch = peerInfo?.branch || peerInfo?.participantBranch || 'Student'
  const peerUniversity = peerInfo?.university || peerInfo?.college || ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Frosted Backdrop */}
      <div
        className="fixed inset-0 bg-[#292724]/30 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={() => {
          // Allow clicking backdrop to close ONLY on failed or ended states
          if (callState === 'failed' || callState === 'ended') {
            onClose?.()
          }
        }}
        aria-hidden="true"
      />

      {/* Glassmorphic Modal Dialog Box */}
      <div
        className="relative w-full max-w-md bg-[rgba(255,255,255,0.88)] backdrop-blur-[24px] border border-[rgba(255,255,255,0.85)] rounded-[28px] shadow-glass-xl p-6 sm:p-8 text-cu-text-main z-10 transition-all animate-in zoom-in-95 fade-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Row with Status Capsule */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(227,213,202,0.6)]">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#292724] text-[#F5EBE0] flex items-center justify-center text-xs font-bold">
              CU
            </span>
            <span className="text-xs font-bold text-cu-text-main uppercase tracking-wider">
              Voice Room
            </span>
          </div>

          {/* Dynamic Status Capsule */}
          <div>
            {callState === 'calling' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(213,189,175,0.4)] text-xs font-bold text-[#292724] border border-[#D5BDAF]">
                <span className="w-2 h-2 rounded-full bg-[#A86832] animate-ping" />
                Ringing...
              </span>
            )}
            {callState === 'incoming' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 border border-emerald-300 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Incoming Call
              </span>
            )}
            {callState === 'connecting' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-xs font-bold text-amber-800 border border-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-spin" />
                Connecting...
              </span>
            )}
            {callState === 'connected' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Connected
              </span>
            )}
            {callState === 'ended' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-700 border border-gray-300">
                Call Ended
              </span>
            )}
            {callState === 'failed' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-xs font-bold text-red-800 border border-red-300">
                Error
              </span>
            )}
          </div>
        </div>

        {/* Peer Profile Display & Visualizer */}
        <div className="py-6 text-center space-y-4">
          {/* Avatar with Animated Pulse Rings */}
          <div className="relative inline-block mx-auto">
            {callState === 'calling' && (
              <div className="absolute -inset-3 rounded-full bg-[rgba(213,189,175,0.45)] animate-ping opacity-75" />
            )}
            {callState === 'incoming' && (
              <div className="absolute -inset-3 rounded-full bg-emerald-400 animate-ping opacity-60" />
            )}
            {callState === 'connected' && (
              <div className="absolute -inset-2 rounded-full bg-emerald-200/50 animate-pulse" />
            )}
            <div className="relative ring-4 ring-white shadow-glass-md rounded-full">
              <Avatar
                src={peerAvatar}
                name={peerName}
                size="2xl"
              />
            </div>
          </div>

          {/* Peer Details */}
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#292724] tracking-tight">
              {peerName}
            </h3>
            <p className="text-xs font-medium text-cu-text-muted mt-1">
              {peerBranch} {peerUniversity ? `• ${peerUniversity}` : ''}
            </p>
          </div>

          {/* Active Call Live Duration & Equalizer */}
          {callState === 'connected' && (
            <div className="space-y-3 pt-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(245,235,224,0.7)] border border-white text-sm font-mono font-bold text-[#292724] shadow-xs">
                <Clock className="w-3.5 h-3.5 text-cu-accent" />
                <span>{formattedDuration || '00:00'}</span>
              </div>

              {/* WebRTC Audio Equalizer Pulse Simulator */}
              <div className="flex items-center justify-center gap-1.5 h-7">
                <span className="w-1 bg-[#292724] rounded-full h-3 animate-pulse" />
                <span className="w-1 bg-[#292724] rounded-full h-6 animate-pulse delay-75" />
                <span className="w-1 bg-[#292724] rounded-full h-7 animate-pulse delay-150" />
                <span className="w-1 bg-[#292724] rounded-full h-4 animate-pulse delay-100" />
                <span className="w-1 bg-[#292724] rounded-full h-6 animate-pulse delay-200" />
              </div>
            </div>
          )}

          {/* Status Subtitle Messages */}
          {callState === 'calling' && (
            <p className="text-xs text-cu-text-subtle font-medium animate-pulse">
              Calling peer... Waiting for {peerName} to answer
            </p>
          )}

          {callState === 'incoming' && (
            <p className="text-xs text-emerald-700 font-semibold">
              Incoming voice call from {peerName}
            </p>
          )}

          {callState === 'connecting' && (
            <p className="text-xs text-amber-700 font-medium animate-pulse">
              Negotiating peer-to-peer audio connection...
            </p>
          )}

          {/* Error Message Alert */}
          {callState === 'failed' && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-left text-xs text-red-800 space-y-1">
              <div className="flex items-center gap-2 font-bold text-red-900">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Call Connection Failed</span>
              </div>
              <p className="text-red-700 leading-relaxed">
                {errorMessage || 'Unable to establish WebRTC audio connection. Please verify your microphone permissions.'}
              </p>
            </div>
          )}

          {/* Call Ended Message */}
          {callState === 'ended' && (
            <div className="text-xs text-cu-text-muted space-y-1">
              <p className="font-semibold text-[#292724]">Call Terminated</p>
              {callDuration > 0 && (
                <p>Call duration: <span className="font-mono font-bold">{formattedDuration}</span></p>
              )}
            </div>
          )}
        </div>

        {/* Interactive Controls Bar */}
        <div className="pt-4 border-t border-[rgba(227,213,202,0.6)] flex items-center justify-center gap-4">
          
          {/* 1. INCOMING CALL SCREEN: Accept & Decline Buttons */}
          {callState === 'incoming' && (
            <>
              <button
                onClick={onDecline}
                className="flex-1 py-3 px-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs"
              >
                <PhoneOff className="w-4 h-4" />
                Decline
              </button>
              <button
                onClick={onAccept}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-soft"
              >
                <Phone className="w-4 h-4" />
                Accept
              </button>
            </>
          )}

          {/* 2. OUTGOING CALL SCREEN: Cancel Button */}
          {callState === 'calling' && (
            <button
              onClick={onEnd}
              className="py-3 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-soft"
            >
              <PhoneOff className="w-4 h-4" />
              Cancel Call
            </button>
          )}

          {/* 3. CONNECTING SCREEN: Cancel Button */}
          {callState === 'connecting' && (
            <button
              onClick={onEnd}
              className="py-3 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-soft"
            >
              <PhoneOff className="w-4 h-4" />
              End Call
            </button>
          )}

          {/* 4. ACTIVE CONNECTED CALL SCREEN: Mute Toggle & End Call */}
          {callState === 'connected' && (
            <div className="flex items-center gap-4">
              <button
                onClick={onToggleMute}
                className={`p-3.5 rounded-full border transition-all ${
                  isMuted
                    ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                    : 'bg-[rgba(245,235,224,0.7)] text-cu-text-main border-[rgba(255,255,255,0.7)] hover:bg-[#D5BDAF]'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={onEnd}
                className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-soft transition-all active:scale-95"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* 5. FAILED OR ENDED SCREEN: Dismiss Button */}
          {(callState === 'failed' || callState === 'ended') && (
            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-[#292724] hover:bg-black text-[#F5EBE0] font-bold text-xs transition-all active:scale-95 shadow-xs"
            >
              Close
            </button>
          )}

        </div>

        {/* Security & Protocol Notice */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-cu-text-subtle flex items-center justify-center gap-1 font-medium">
            <ShieldCheck className="w-3 h-3 text-cu-success flex-shrink-0" />
            <span>Encrypted WebRTC peer-to-peer audio • ConnectU signaling</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VoiceCallModal