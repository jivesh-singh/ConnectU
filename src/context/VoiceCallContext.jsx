import React, { createContext, useContext } from 'react'
import { useWebRTCCall } from '../hooks/useWebRTCCall'
import { VoiceCallModal } from '../components/voice/VoiceCallModal'

const VoiceCallContext = createContext(null)

/**
 * VoiceCallProvider
 * 
 * Provides global one-to-one WebRTC voice calling capabilities across
 * all authenticated pages of ConnectU. Automatically mounts the
 * VoiceCallModal so incoming calls ring and active calls persist
 * across dashboard navigation.
 */
export function VoiceCallProvider({ children }) {
  const callControls = useWebRTCCall()

  return (
    <VoiceCallContext.Provider value={callControls}>
      {children}
      {/* Global Voice Call Modal mounted for all authenticated routes */}
      <VoiceCallModal
        isOpen={callControls.callState !== 'idle'}
        callState={callControls.callState}
        peerInfo={callControls.peerInfo}
        formattedDuration={callControls.formattedDuration}
        callDuration={callControls.callDuration}
        isMuted={callControls.isMuted}
        errorMessage={callControls.errorMessage}
        onAccept={callControls.acceptCall}
        onDecline={callControls.rejectCall}
        onEnd={callControls.endCall}
        onToggleMute={callControls.toggleMute}
        onClose={callControls.endCall}
      />
    </VoiceCallContext.Provider>
  )
}

/**
 * Hook to access voice calling state and actions
 */
export function useVoiceCall() {
  const context = useContext(VoiceCallContext)
  if (!context) {
    throw new Error('useVoiceCall must be used within a VoiceCallProvider')
  }
  return context
}

export default VoiceCallContext