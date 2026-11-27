import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Registry of active Supabase Realtime channels to prevent duplicate
 * subscriptions and ensure complete teardown.
 */
const activeChannels = new Map()

function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please check your environment variables.')
  }
}

/**
 * ConnectU WebRTC Call Signaling Service
 * Interfaces with Supabase database tables `call_sessions` and `call_signals`
 * and Supabase Realtime postgres_changes channels.
 */
export const callSignalingService = {
  /**
   * 1. Start an outgoing call session
   * Creates a new record in `public.call_sessions` with initial status 'ringing'.
   * 
   * @param {Object} params
   * @param {string} params.receiverId - UUID of student receiving the call
   * @param {string} [params.conversationId] - Optional UUID of associated conversation
   * @returns {Promise<Object>} Created call_session record
   */
  async startOutgoingCall({ receiverId, conversationId = null }) {
    ensureSupabaseConfigured()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authenticated user required to start a call session.')
    }

    if (user.id === receiverId) {
      throw new Error('Cannot start a call session with yourself.')
    }

    const payload = {
      caller_id: user.id,
      receiver_id: receiverId,
      conversation_id: conversationId || null,
      status: 'ringing'
    }

    const { data, error } = await supabase
      .from('call_sessions')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('Failed to start call session:', error)
      throw error
    }

    return data
  },

  /**
   * 2. Send SDP Offer
   * Posts an 'offer' signal to `public.call_signals`.
   * 
   * @param {string} callSessionId - UUID of the call session
   * @param {string} receiverId - UUID of peer receiving the offer
   * @param {RTCSessionDescriptionInit|Object} sdpOffer - SDP offer object ({ type: 'offer', sdp: '...' })
   * @returns {Promise<Object>} Inserted call_signals record
   */
  async sendCallOffer(callSessionId, receiverId, sdpOffer) {
    ensureSupabaseConfigured()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authenticated user required to send call offer.')
    }

    const offerPayload = {
      type: sdpOffer.type || 'offer',
      sdp: sdpOffer.sdp
    }

    const { data, error } = await supabase
      .from('call_signals')
      .insert({
        call_session_id: callSessionId,
        sender_id: user.id,
        receiver_id: receiverId,
        signal_type: 'offer',
        signal_data: offerPayload
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to send call offer:', error)
      throw error
    }

    return data
  },

  /**
   * 3. Send SDP Answer
   * Posts an 'answer' signal to `public.call_signals`.
   * 
   * @param {string} callSessionId - UUID of the call session
   * @param {string} receiverId - UUID of peer receiving the answer (the original caller)
   * @param {RTCSessionDescriptionInit|Object} sdpAnswer - SDP answer object ({ type: 'answer', sdp: '...' })
   * @returns {Promise<Object>} Inserted call_signals record
   */
  async sendCallAnswer(callSessionId, receiverId, sdpAnswer) {
    ensureSupabaseConfigured()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authenticated user required to send call answer.')
    }

    const answerPayload = {
      type: sdpAnswer.type || 'answer',
      sdp: sdpAnswer.sdp
    }

    const { data, error } = await supabase
      .from('call_signals')
      .insert({
        call_session_id: callSessionId,
        sender_id: user.id,
        receiver_id: receiverId,
        signal_type: 'answer',
        signal_data: answerPayload
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to send call answer:', error)
      throw error
    }

    return data
  },

  /**
   * 4. Send ICE Candidate
   * Posts an 'ice-candidate' signal to `public.call_signals`.
   * 
   * @param {string} callSessionId - UUID of the call session
   * @param {string} receiverId - UUID of peer receiving candidate
   * @param {RTCIceCandidate|Object} candidate - Candidate object or instance
   * @returns {Promise<Object>} Inserted call_signals record
   */
  async sendIceCandidate(callSessionId, receiverId, candidate) {
    ensureSupabaseConfigured()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authenticated user required to send ICE candidate.')
    }

    const candidatePayload = candidate?.toJSON ? candidate.toJSON() : {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex,
      usernameFragment: candidate.usernameFragment || null
    }

    const { data, error } = await supabase
      .from('call_signals')
      .insert({
        call_session_id: callSessionId,
        sender_id: user.id,
        receiver_id: receiverId,
        signal_type: 'ice-candidate',
        signal_data: candidatePayload
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to send ICE candidate:', error)
      throw error
    }

    return data
  },

  /**
   * 5. Listen for Incoming Calls
   * Subscribes to `public.call_sessions` INSERT events filtered by receiver_id.
   * Prevents duplicate channel subscriptions.
   * 
   * @param {string} userId - UUID of current student listening for incoming calls
   * @param {Function} onIncomingCall - Callback invoked with new call session
   * @returns {Function} Unsubscribe cleanup function
   */
  listenForIncomingCalls(userId, onIncomingCall) {
    ensureSupabaseConfigured()

    const channelKey = `incoming_calls:${userId}`

    // Teardown existing channel if duplicate subscription attempted
    if (activeChannels.has(channelKey)) {
      const oldChannel = activeChannels.get(channelKey)
      supabase.removeChannel(oldChannel)
      activeChannels.delete(channelKey)
    }

    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_sessions',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          if (payload.new && payload.new.status === 'ringing') {
            onIncomingCall(payload.new)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn(`Incoming calls subscription error on channel: ${channelKey}`)
        }
      })

    activeChannels.set(channelKey, channel)

    // Return cleanup function
    return () => {
      if (activeChannels.get(channelKey) === channel) {
        activeChannels.delete(channelKey)
      }
      supabase.removeChannel(channel)
    }
  },

  /**
   * 6. Listen for Call Signals (Offer, Answer, ICE Candidates)
   * Subscribes to `public.call_signals` INSERT events for a specific call session.
   * Filters out self-generated signals so peer only processes incoming data.
   * 
   * @param {string} callSessionId - UUID of the active call session
   * @param {string} currentUserId - UUID of current user (to filter out self signals)
   * @param {Function} onSignal - Callback invoked with signal payload
   * @returns {Function} Unsubscribe cleanup function
   */
  listenForCallSignals(callSessionId, currentUserId, onSignal) {
    ensureSupabaseConfigured()

    const channelKey = `call_signals:${callSessionId}`

    if (activeChannels.has(channelKey)) {
      const oldChannel = activeChannels.get(channelKey)
      supabase.removeChannel(oldChannel)
      activeChannels.delete(channelKey)
    }

    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signals',
          filter: `call_session_id=eq.${callSessionId}`
        },
        (payload) => {
          const signal = payload.new
          if (!signal) return

          // Ignore own signals
          if (signal.sender_id === currentUserId) return

          onSignal({
            id: signal.id,
            callSessionId: signal.call_session_id,
            senderId: signal.sender_id,
            receiverId: signal.receiver_id,
            signalType: signal.signal_type,
            signalData: signal.signal_data,
            createdAt: signal.created_at
          })
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn(`Call signals subscription error on channel: ${channelKey}`)
        }
      })

    activeChannels.set(channelKey, channel)

    return () => {
      if (activeChannels.get(channelKey) === channel) {
        activeChannels.delete(channelKey)
      }
      supabase.removeChannel(channel)
    }
  },

  /**
   * 7. Listen for Call Session Updates (Status changes: connected, ended, declined, missed)
   * 
   * @param {string} callSessionId - UUID of the call session
   * @param {Function} onUpdate - Callback invoked with updated call session
   * @returns {Function} Unsubscribe cleanup function
   */
  listenForCallSessionUpdates(callSessionId, onUpdate) {
    ensureSupabaseConfigured()

    const channelKey = `call_session_updates:${callSessionId}`

    if (activeChannels.has(channelKey)) {
      const oldChannel = activeChannels.get(channelKey)
      supabase.removeChannel(oldChannel)
      activeChannels.delete(channelKey)
    }

    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_sessions',
          filter: `id=eq.${callSessionId}`
        },
        (payload) => {
          if (payload.new) {
            onUpdate(payload.new)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn(`Call session update subscription error on channel: ${channelKey}`)
        }
      })

    activeChannels.set(channelKey, channel)

    return () => {
      if (activeChannels.get(channelKey) === channel) {
        activeChannels.delete(channelKey)
      }
      supabase.removeChannel(channel)
    }
  },

  /**
   * 8. Accept Call
   * Receiver accepts an incoming ringing call session.
   * Enforces trigger requirement: only receiver can set status to 'connected'.
   * 
   * @param {string} callSessionId - UUID of call session
   * @returns {Promise<Object>} Updated call_session record
   */
  async acceptCall(callSessionId) {
    ensureSupabaseConfigured()

    const { data, error } = await supabase
      .from('call_sessions')
      .update({ status: 'connected' })
      .eq('id', callSessionId)
      .select()
      .single()

    if (error) {
      console.error('Failed to accept call session:', error)
      throw error
    }

    return data
  },

  /**
   * 9. Reject / Decline Call
   * Receiver declines an incoming ringing call session.
   * Enforces trigger requirement: only receiver can set status to 'declined'.
   * 
   * @param {string} callSessionId - UUID of call session
   * @returns {Promise<Object>} Updated call_session record
   */
  async rejectCall(callSessionId) {
    ensureSupabaseConfigured()

    const { data, error } = await supabase
      .from('call_sessions')
      .update({ status: 'declined' })
      .eq('id', callSessionId)
      .select()
      .single()

    if (error) {
      console.error('Failed to reject call session:', error)
      throw error
    }

    this.cleanupCallSubscriptions(callSessionId)
    return data
  },

  /**
   * 10. End Call
   * Terminate an active or ringing call session.
   * Handles appropriate state transitions based on caller/receiver role and current status:
   * - If 'ringing' and caller cancels -> 'missed'
   * - If 'ringing' and receiver declines -> 'declined'
   * - If 'connected' -> 'ended'
   * 
   * @param {string} callSessionId - UUID of call session
   * @returns {Promise<Object>} Updated call_session record
   */
  async endCall(callSessionId) {
    ensureSupabaseConfigured()

    const { data: { user } } = await supabase.auth.getUser()
    const currentUserId = user?.id

    // Fetch current state to determine proper status transition
    const { data: session, error: fetchError } = await supabase
      .from('call_sessions')
      .select('status, caller_id, receiver_id')
      .eq('id', callSessionId)
      .single()

    if (fetchError || !session) {
      this.cleanupCallSubscriptions(callSessionId)
      return null
    }

    // Already in a terminal state
    if (['ended', 'missed', 'declined'].includes(session.status)) {
      this.cleanupCallSubscriptions(callSessionId)
      return session
    }

    let nextStatus = 'ended'
    if (session.status === 'ringing') {
      if (currentUserId === session.caller_id) {
        nextStatus = 'missed' // Caller canceled
      } else if (currentUserId === session.receiver_id) {
        nextStatus = 'declined' // Receiver rejected
      }
    }

    const { data, error } = await supabase
      .from('call_sessions')
      .update({ status: nextStatus })
      .eq('id', callSessionId)
      .select()
      .single()

    if (error) {
      console.error('Failed to end call session:', error)
      throw error
    }

    this.cleanupCallSubscriptions(callSessionId)
    return data
  },

  /**
   * 11. Fetch Single Call Session
   * 
   * @param {string} callSessionId - UUID of call session
   * @returns {Promise<Object|null>}
   */
  async getCallSession(callSessionId) {
    ensureSupabaseConfigured()

    const { data, error } = await supabase
      .from('call_sessions')
      .select('*')
      .eq('id', callSessionId)
      .maybeSingle()

    if (error) {
      console.error('Failed to fetch call session:', error)
      throw error
    }

    return data
  },

  /**
   * 12. Cleanup Subscriptions for a specific Call Session
   * 
   * @param {string} callSessionId
   */
  cleanupCallSubscriptions(callSessionId) {
    const signalKey = `call_signals:${callSessionId}`
    if (activeChannels.has(signalKey)) {
      supabase.removeChannel(activeChannels.get(signalKey))
      activeChannels.delete(signalKey)
    }

    const updateKey = `call_session_updates:${callSessionId}`
    if (activeChannels.has(updateKey)) {
      supabase.removeChannel(activeChannels.get(updateKey))
      activeChannels.delete(updateKey)
    }
  },

  /**
   * 13. Teardown All Active Realtime Subscriptions
   */
  cleanupAllSubscriptions() {
    activeChannels.forEach((channel) => {
      supabase.removeChannel(channel)
    })
    activeChannels.clear()
  }
}

export default callSignalingService
