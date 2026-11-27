import { useState, useEffect, useRef, useCallback } from 'react'
import { callSignalingService } from '../services/callSignalingService'
import { supabase } from '../services/supabase'
import { useAuth } from './useAuth'

/**
 * Free public Google STUN servers for WebRTC NAT traversal.
 * Zero paid TURN or proprietary SDK dependencies.
 */
const RTC_CONFIGURATION = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ]
}

/**
 * Custom React Hook for Managing 1-to-1 WebRTC Voice Calls
 * 
 * Manages native browser WebRTC peer connections, microphone audio tracks,
 * incoming call listeners, and Supabase Realtime call signaling.
 * 
 * Call States:
 * - 'idle': No active, outgoing, or incoming call.
 * - 'calling': Outgoing call initiated; ringing peer.
 * - 'incoming': Inbound call received; awaiting user decision.
 * - 'connecting': Call accepted; exchanging SDP and ICE candidates.
 * - 'connected': WebRTC audio peer connection active and streaming.
 * - 'ended': Call terminated normally or declined.
 * - 'failed': Connection error or microphone permission denied.
 */
export function useWebRTCCall() {
  const { user } = useAuth()
  const currentUserId = user?.id

  // Call State Management
  const [callState, setCallState] = useState('idle')
  const [currentCall, setCurrentCall] = useState(null)
  const [peerInfo, setPeerInfo] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [errorMessage, setErrorMessage] = useState(null)

  // WebRTC & Audio DOM References
  const peerConnectionRef = useRef(null)
  const localStreamRef = useRef(null)
  const remoteAudioRef = useRef(null)
  const queuedCandidatesRef = useRef([])
  const bufferedOfferRef = useRef(null)

  // Subscription Cleanup References
  const unsubscribeSignalsRef = useRef(null)
  const unsubscribeUpdatesRef = useRef(null)
  const incomingCallsUnsubRef = useRef(null)

  // State synchronization ref for async callbacks
  const callStateRef = useRef('idle')
  const currentCallRef = useRef(null)

  useEffect(() => {
    callStateRef.current = callState
  }, [callState])

  useEffect(() => {
    currentCallRef.current = currentCall
  }, [currentCall])

  // Initialize background HTML audio element for remote stream playback
  useEffect(() => {
    if (typeof window !== 'undefined' && !remoteAudioRef.current) {
      const audio = new Audio()
      audio.autoplay = true
      remoteAudioRef.current = audio
    }

    return () => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.pause()
        remoteAudioRef.current.srcObject = null
        remoteAudioRef.current = null
      }
    }
  }, [])

  // Call duration timer (increments every second when in 'connected' state)
  useEffect(() => {
    let interval = null
    if (callState === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    } else {
      setCallDuration(0)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [callState])

  /**
   * Helper: Stop all active microphone tracks
   */
  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      localStreamRef.current = null
    }
  }, [])

  /**
   * Helper: Close RTCPeerConnection and release references
   */
  const closePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null
      peerConnectionRef.current.ontrack = null
      peerConnectionRef.current.oniceconnectionstatechange = null
      peerConnectionRef.current.onconnectionstatechange = null
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    queuedCandidatesRef.current = []
    bufferedOfferRef.current = null
  }, [])

  /**
   * Helper: Unsubscribe from Realtime session channels
   */
  const cleanupSubscriptions = useCallback(() => {
    if (unsubscribeSignalsRef.current) {
      unsubscribeSignalsRef.current()
      unsubscribeSignalsRef.current = null
    }
    if (unsubscribeUpdatesRef.current) {
      unsubscribeUpdatesRef.current()
      unsubscribeUpdatesRef.current = null
    }
    if (currentCallRef.current?.id) {
      callSignalingService.cleanupCallSubscriptions(currentCallRef.current.id)
    }
  }, [])

  /**
   * Helper: Full local teardown of audio, peer connection, and channels
   */
  const cleanupCall = useCallback(() => {
    stopLocalStream()
    closePeerConnection()
    cleanupSubscriptions()

    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause()
      remoteAudioRef.current.srcObject = null
    }

    setIsMuted(false)
  }, [stopLocalStream, closePeerConnection, cleanupSubscriptions])

  /**
   * Helper: Drain any remote ICE candidates that arrived before setRemoteDescription
   */
  const drainCandidateQueue = useCallback(async (pc) => {
    if (!pc || !pc.remoteDescription) return

    while (queuedCandidatesRef.current.length > 0) {
      const candidateData = queuedCandidatesRef.current.shift()
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidateData))
      } catch (err) {
        console.warn('Error adding queued ICE candidate:', err)
      }
    }
  }, [])

  /**
   * Create and configure a new RTCPeerConnection
   */
  const createPeerConnection = useCallback((sessionId, remotePeerId) => {
    closePeerConnection()

    const pc = new RTCPeerConnection(RTC_CONFIGURATION)
    peerConnectionRef.current = pc

    // Attach local audio tracks
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current)
      })
    }

    // Send local ICE candidates to peer through callSignalingService
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        callSignalingService.sendIceCandidate(sessionId, remotePeerId, event.candidate)
          .catch(err => console.warn('Failed to send ICE candidate:', err))
      }
    }

    // Playback incoming remote audio track
    pc.ontrack = (event) => {
      if (remoteAudioRef.current && event.streams[0]) {
        remoteAudioRef.current.srcObject = event.streams[0]
        remoteAudioRef.current.play().catch(err => {
          console.warn('Audio auto-play policy prevented immediate playback:', err)
        })
      }
    }

    // Monitor peer connection status
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState
      if (state === 'connected') {
        setCallState('connected')
        setErrorMessage(null)
      } else if (state === 'disconnected') {
        console.warn('WebRTC peer disconnected')
      } else if (state === 'failed') {
        setErrorMessage('WebRTC peer connection failed.')
        setCallState('failed')
        cleanupCall()
      } else if (state === 'closed') {
        if (callStateRef.current === 'connected') {
          setCallState('ended')
        }
      }
    }

    pc.oniceconnectionstatechange = () => {
      const iceState = pc.iceConnectionState
      if (iceState === 'connected' || iceState === 'completed') {
        setCallState('connected')
      } else if (iceState === 'failed') {
        console.warn('ICE connection failed, attempting ICE restart')
        pc.restartIce?.()
      }
    }

    return pc
  }, [closePeerConnection, cleanupCall])

  /**
   * 1. Initiate Outgoing Call
   */
  const initiateCall = useCallback(async (receiverId, conversationId = null, peerData = null) => {
    if (!receiverId) {
      throw new Error('Receiver ID is required to start a call.')
    }

    if (callStateRef.current !== 'idle') {
      console.warn('Cannot initiate call: already in an active/pending call session.')
      return
    }

    setErrorMessage(null)
    setCallState('calling')

    // Set peer metadata immediately if provided, or fetch from public_profiles
    if (peerData) {
      setPeerInfo(peerData)
    } else {
      try {
        const { data: profile } = await supabase
          .from('public_profiles')
          .select('id, full_name, avatar_url, branch, university')
          .eq('id', receiverId)
          .maybeSingle()
        if (profile) {
          setPeerInfo({
            id: profile.id,
            fullName: profile.full_name || 'Student Peer',
            avatar: profile.avatar_url,
            branch: profile.branch,
            university: profile.university
          })
        } else {
          setPeerInfo({ id: receiverId, fullName: 'Student Peer', avatar: null })
        }
      } catch (err) {
        setPeerInfo({ id: receiverId, fullName: 'Student Peer', avatar: null })
      }
    }

    try {
      // 1. Request microphone access
      let localStream
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        localStreamRef.current = localStream
      } catch (micErr) {
        const msg = micErr.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access to make voice calls.'
          : 'Could not access microphone hardware.'
        setErrorMessage(msg)
        setCallState('failed')
        throw new Error(msg)
      }

      // 2. Create call session in Supabase database
      const session = await callSignalingService.startOutgoingCall({
        receiverId,
        conversationId
      })
      setCurrentCall(session)

      // 3. Setup RTCPeerConnection and generate SDP Offer
      const pc = createPeerConnection(session.id, receiverId)
      const offer = await pc.createOffer({ offerToReceiveAudio: true })
      await pc.setLocalDescription(offer)

      // 4. Send SDP Offer through Supabase call_signals
      await callSignalingService.sendCallOffer(session.id, receiverId, offer)

      // 5. Subscribe to session status updates (receiver accepts, declines, etc.)
      unsubscribeUpdatesRef.current = callSignalingService.listenForCallSessionUpdates(
        session.id,
        (updatedSession) => {
          setCurrentCall(updatedSession)

          if (updatedSession.status === 'connected') {
            setCallState('connecting')
          } else if (updatedSession.status === 'declined') {
            setErrorMessage('Call was declined.')
            setCallState('ended')
            cleanupCall()
            setTimeout(() => {
              setCallState('idle')
              setPeerInfo(null)
            }, 2000)
          } else if (updatedSession.status === 'missed') {
            setErrorMessage('Call was not answered.')
            setCallState('ended')
            cleanupCall()
            setTimeout(() => {
              setCallState('idle')
              setPeerInfo(null)
            }, 2000)
          } else if (updatedSession.status === 'ended') {
            setCallState('ended')
            cleanupCall()
            setTimeout(() => {
              setCallState('idle')
              setPeerInfo(null)
            }, 2000)
          }
        }
      )

      // 6. Subscribe to incoming call signals (SDP Answer, ICE Candidates)
      unsubscribeSignalsRef.current = callSignalingService.listenForCallSignals(
        session.id,
        currentUserId,
        async (signal) => {
          const activePc = peerConnectionRef.current
          if (!activePc) return

          if (signal.signalType === 'answer') {
            try {
              if (activePc.signalingState !== 'stable') {
                await activePc.setRemoteDescription(new RTCSessionDescription(signal.signalData))
                await drainCandidateQueue(activePc)
              }
            } catch (err) {
              console.error('Error applying remote SDP answer:', err)
            }
          } else if (signal.signalType === 'ice-candidate') {
            if (activePc.remoteDescription) {
              try {
                await activePc.addIceCandidate(new RTCIceCandidate(signal.signalData))
              } catch (err) {
                console.warn('Error adding incoming ICE candidate:', err)
              }
            } else {
              queuedCandidatesRef.current.push(signal.signalData)
            }
          }
        }
      )

      return session
    } catch (err) {
      console.error('initiateCall failed:', err)
      cleanupCall()
      if (callStateRef.current !== 'failed') {
        setErrorMessage(err.message || 'Call initialization failed.')
        setCallState('failed')
      }
      throw err
    }
  }, [createPeerConnection, currentUserId, cleanupCall, drainCandidateQueue])

  /**
   * 2. Accept Incoming Call
   */
  const acceptCall = useCallback(async (callData = null) => {
    const session = callData || currentCallRef.current
    if (!session || !session.id) {
      throw new Error('No incoming call session available to accept.')
    }

    setErrorMessage(null)
    setCallState('connecting')

    try {
      // 1. Request microphone access
      let localStream
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        localStreamRef.current = localStream
      } catch (micErr) {
        const msg = micErr.name === 'NotAllowedError'
          ? 'Microphone permission denied. Cannot connect call.'
          : 'Microphone hardware unavailable.'
        setErrorMessage(msg)
        setCallState('failed')
        await callSignalingService.rejectCall(session.id).catch(() => {})
        cleanupCall()
        throw new Error(msg)
      }

      // 2. Notify database of acceptance (transitions ringing -> connected)
      const updatedSession = await callSignalingService.acceptCall(session.id)
      setCurrentCall(updatedSession)

      // 3. Setup RTCPeerConnection
      const pc = createPeerConnection(session.id, session.caller_id)

      // 4. Subscribe to session updates (e.g. caller ends)
      if (!unsubscribeUpdatesRef.current) {
        unsubscribeUpdatesRef.current = callSignalingService.listenForCallSessionUpdates(
          session.id,
          (upd) => {
            setCurrentCall(upd)
            if (upd.status === 'ended' || upd.status === 'missed') {
              setCallState('ended')
              cleanupCall()
              setTimeout(() => setCallState('idle'), 2000)
            }
          }
        )
      }

      // 5. Function to process an incoming SDP offer and reply with SDP Answer
      const processOffer = async (offerData) => {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offerData))
          await drainCandidateQueue(pc)

          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)

          await callSignalingService.sendCallAnswer(session.id, session.caller_id, answer)
        } catch (err) {
          console.error('Error generating and sending call answer:', err)
          setErrorMessage('Failed to establish audio stream.')
          setCallState('failed')
          cleanupCall()
        }
      }

      // Check if offer already arrived and buffered
      if (bufferedOfferRef.current) {
        await processOffer(bufferedOfferRef.current)
        bufferedOfferRef.current = null
      }

      // 6. Listen for incoming signals if not already listening
      if (!unsubscribeSignalsRef.current) {
        unsubscribeSignalsRef.current = callSignalingService.listenForCallSignals(
          session.id,
          currentUserId,
          async (signal) => {
            const activePc = peerConnectionRef.current
            if (!activePc) return

            if (signal.signalType === 'offer') {
              if (activePc.remoteDescription) return
              await processOffer(signal.signalData)
            } else if (signal.signalType === 'ice-candidate') {
              if (activePc.remoteDescription) {
                try {
                  await activePc.addIceCandidate(new RTCIceCandidate(signal.signalData))
                } catch (err) {
                  console.warn('Error adding incoming ICE candidate:', err)
                }
              } else {
                queuedCandidatesRef.current.push(signal.signalData)
              }
            }
          }
        )
      }

      return updatedSession
    } catch (err) {
      console.error('acceptCall failed:', err)
      cleanupCall()
      if (callStateRef.current !== 'failed') {
        setErrorMessage(err.message || 'Failed to accept call.')
        setCallState('failed')
      }
      throw err
    }
  }, [createPeerConnection, currentUserId, cleanupCall, drainCandidateQueue])

  /**
   * 3. Reject / Decline Call
   */
  const rejectCall = useCallback(async (callId = null) => {
    const targetSessionId = callId || currentCallRef.current?.id
    if (targetSessionId) {
      try {
        await callSignalingService.rejectCall(targetSessionId)
      } catch (err) {
        console.warn('Error rejecting call session:', err)
      }
    }

    cleanupCall()
    setCurrentCall(null)
    setPeerInfo(null)
    setCallState('idle')
    setErrorMessage(null)
  }, [cleanupCall])

  /**
   * 4. End Call
   */
  const endCall = useCallback(async () => {
    const targetSessionId = currentCallRef.current?.id
    if (targetSessionId) {
      try {
        await callSignalingService.endCall(targetSessionId)
      } catch (err) {
        console.warn('Error ending call session:', err)
      }
    }

    cleanupCall()
    setCallState('ended')
    setTimeout(() => {
      setCallState('idle')
      setCurrentCall(null)
      setPeerInfo(null)
      setErrorMessage(null)
    }, 1500)
  }, [cleanupCall])

  /**
   * 5. Toggle Local Microphone Mute
   */
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks()
      const newMutedState = !isMuted

      audioTracks.forEach(track => {
        track.enabled = !newMutedState
      })

      setIsMuted(newMutedState)
    }
  }, [isMuted])

  /**
   * Background Listener: Automatically detect incoming calls for logged-in user
   */
  useEffect(() => {
    if (!currentUserId) return

    // Prevent duplicate subscriptions
    if (incomingCallsUnsubRef.current) {
      incomingCallsUnsubRef.current()
    }

    incomingCallsUnsubRef.current = callSignalingService.listenForIncomingCalls(
      currentUserId,
      async (incomingSession) => {
        // Only accept new incoming call if currently idle
        if (callStateRef.current === 'idle') {
          setCurrentCall(incomingSession)
          setCallState('incoming')
          setErrorMessage(null)

          // Fetch caller details from public_profiles
          try {
            const { data: profile } = await supabase
              .from('public_profiles')
              .select('id, full_name, avatar_url, branch, university')
              .eq('id', incomingSession.caller_id)
              .maybeSingle()
            if (profile) {
              setPeerInfo({
                id: profile.id,
                fullName: profile.full_name || 'Student Peer',
                avatar: profile.avatar_url,
                branch: profile.branch,
                university: profile.university
              })
            } else {
              setPeerInfo({
                id: incomingSession.caller_id,
                fullName: 'Student Peer',
                avatar: null
              })
            }
          } catch (err) {
            setPeerInfo({
              id: incomingSession.caller_id,
              fullName: 'Student Peer',
              avatar: null
            })
          }

          // Pre-listen to signals in case offer arrives before user clicks accept
          unsubscribeSignalsRef.current = callSignalingService.listenForCallSignals(
            incomingSession.id,
            currentUserId,
            (signal) => {
              if (signal.signalType === 'offer') {
                bufferedOfferRef.current = signal.signalData
              } else if (signal.signalType === 'ice-candidate') {
                queuedCandidatesRef.current.push(signal.signalData)
              }
            }
          )

          // Also listen to session updates in case caller cancels before answering
          unsubscribeUpdatesRef.current = callSignalingService.listenForCallSessionUpdates(
            incomingSession.id,
            (upd) => {
              if (upd.status === 'missed' || upd.status === 'declined' || upd.status === 'ended') {
                cleanupCall()
                setCurrentCall(null)
                setPeerInfo(null)
                setCallState('idle')
              }
            }
          )
        }
      }
    )

    return () => {
      if (incomingCallsUnsubRef.current) {
        incomingCallsUnsubRef.current()
        incomingCallsUnsubRef.current = null
      }
    }
  }, [currentUserId, cleanupCall])

  // Component unmount safety: teardown all active media & connections
  useEffect(() => {
    return () => {
      cleanupCall()
    }
  }, [cleanupCall])

  /**
   * Formatted MM:SS duration string
   */
  const formattedDuration = `${Math.floor(callDuration / 60)
    .toString()
    .padStart(2, '0')}:${(callDuration % 60).toString().padStart(2, '0')}`

  return {
    callState,
    currentCall,
    peerInfo,
    isMuted,
    callDuration,
    formattedDuration,
    errorMessage,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    remoteAudioRef,
    localStream: localStreamRef.current
  }
}

export default useWebRTCCall
