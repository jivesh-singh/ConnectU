import { DEMO_PREVIEW_STUDENTS, INITIAL_USER_PROFILE, DEMO_CONVERSATIONS, DEMO_COLLABORATIONS } from './mockData'
import { isSupabaseConfigured, supabase } from './supabase'

const STORAGE_KEY_STUDENTS = 'connectu_students_v1'
const STORAGE_KEY_USER = 'connectu_current_user_v1'
const STORAGE_KEY_CHATS = 'connectu_conversations_v1'

// Explicit fields vetted and exposed by public.public_profiles SQL view
const PUBLIC_PROFILE_FIELDS =
  'id, full_name, avatar_url, university, college, branch, academic_year, semester, bio, skills, interests, collaboration_preferences, working_style, top_interests, secondary_interests, hobbies, quiz_completed, profile_completion, show_online_status, allow_direct_messages, created_at'

// Initialize LocalStorage defaults safely if not already present
function initStorage() {
  if (typeof window === 'undefined') return

  if (!localStorage.getItem(STORAGE_KEY_STUDENTS)) {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(DEMO_PREVIEW_STUDENTS))
  }
  if (!localStorage.getItem(STORAGE_KEY_USER)) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(INITIAL_USER_PROFILE))
  }
  if (!localStorage.getItem(STORAGE_KEY_CHATS)) {
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(DEMO_CONVERSATIONS))
  }
}

export const studentService = {
  // 1. Get current logged in / demo student profile
  async getCurrentUserProfile() {
    if (isSupabaseConfigured) {
      try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser()
        if (user) {
          const meta = user.user_metadata || {}
          let profileData = null
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle()
            if (!error && data) profileData = data
          } catch (err) {
            console.warn('Profiles table query fallback:', err)
          }

          const fullName =
            profileData?.full_name ||
            profileData?.fullName ||
            meta.full_name ||
            meta.name ||
            user.email ||
            'Student'

          const avatar =
            profileData?.avatar_url ||
            profileData?.avatar ||
            meta.avatar_url ||
            meta.picture ||
            null

          return {
            ...profileData,
            id: user.id,
            email: user.email || meta.email || profileData?.email || '',
            fullName,
            full_name: fullName,
            name: fullName,
            avatar,
            avatar_url: avatar,
            picture: avatar,
            university: profileData?.university || meta.university || 'Stanford University',
            college: profileData?.college || meta.college || 'School of Engineering',
            branch: profileData?.branch || meta.branch || 'Computer Science',
            academicYear: profileData?.academic_year || profileData?.academicYear || '3rd Year',
            semester: profileData?.semester || '6th Semester',
            skills: profileData?.skills || ['React', 'TypeScript', 'Tailwind CSS', 'Python'],
            interests: profileData?.interests || profileData?.top_interests || ['Technology', 'AI and ML'],
            workingStyle: profileData?.working_style || profileData?.workingStyle || 'Technical Builder',
            profileCompletion: profileData?.profile_completion ?? 85,
            quizCompleted: Boolean(profileData?.quiz_completed)
          }
        }
      } catch (err) {
        console.warn('Could not fetch Supabase profile:', err)
      }
    }

    // Return demo profile only if explicitly demo session
    const savedAuth = typeof window !== 'undefined' ? localStorage.getItem('connectu_auth_state_v1') : null
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth)
        if (parsed.isDemoStudent && parsed.user) return parsed.user
      } catch (e) {}
    }

    return INITIAL_USER_PROFILE
  },

  // 2. Update student profile
  async updateProfile(updates) {
    if (isSupabaseConfigured) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr) {
        throw new Error(`Authentication error: ${authErr.message}`)
      }
      if (user) {
        // Map camelCase fields to database column names
        const dbPayload = {
          email: user.email,
          id: user.id,
          full_name: updates.fullName ?? updates.full_name ?? updates.name,
          avatar_url: updates.avatar ?? updates.avatar_url ?? updates.picture,
          university: updates.university,
          college: updates.college,
          branch: updates.branch,
          academic_year: updates.academicYear ?? updates.academic_year,
          semester: updates.semester,
          bio: updates.bio,
          skills: updates.skills,
          interests: updates.interests,
          collaboration_preferences: updates.collaborationPreferences ?? updates.collaboration_preferences,
          is_public: updates.privacy?.isPublic ?? updates.is_public,
          show_online_status: updates.privacy?.showOnlineStatus ?? updates.show_online_status,
          allow_direct_messages: updates.privacy?.allowDirectMessages ?? updates.allow_direct_messages,
          updated_at: new Date().toISOString()
        }

        const cleanedPayload = Object.fromEntries(
          Object.entries(dbPayload).filter(([_, v]) => v !== undefined)
        )

        const { error } = await supabase.from('profiles').upsert(cleanedPayload)
        if (error) {
          console.error('Supabase profile update failed:', error)
          throw new Error(`Database error: ${error.message || 'Failed to update profile'}`)
        }

        return this.getCurrentUserProfile()
      }
    }

    // Local fallback for demo mode
    initStorage()
    const current = await this.getCurrentUserProfile()
    const updated = { ...current, ...updates }
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated))
    return updated
  },

  // 2b. Save full interest discovery quiz profile & historical attempt
  async saveQuizProfile(quizData) {
    initStorage()
    const current = await this.getCurrentUserProfile()

    // Preserve historical attempts locally
    const historyRaw = localStorage.getItem('connectu_quiz_history_v1')
    const history = historyRaw ? JSON.parse(historyRaw) : []
    const newAttempt = {
      id: `attempt-${Date.now()}`,
      completedAt: quizData.completedAt || new Date().toISOString(),
      workingStyle: quizData.workingStyle,
      topInterests: quizData.topInterests,
      hobbies: quizData.hobbies,
      answers: quizData.answers
    }
    localStorage.setItem('connectu_quiz_history_v1', JSON.stringify([newAttempt, ...history]))

    // Update active user profile
    const profileUpdates = {
      quizResult: quizData,
      workingStyle: quizData.workingStyle,
      topInterests: quizData.topInterests,
      secondaryInterests: quizData.secondaryInterests,
      hobbies: quizData.hobbies,
      interests: (quizData.topInterests && quizData.topInterests.length > 0)
        ? quizData.topInterests
        : current.interests,
      profileCompletion: 100,
      quizCompleted: true,
      lastQuizDate: quizData.completedAt
    }

    const updated = { ...current, ...profileUpdates }
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated))

    // If Supabase is connected, sync to profiles and historical quiz_attempts table
    if (isSupabaseConfigured) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr) {
        throw new Error(`Authentication error: ${authErr.message}`)
      }
      if (user) {
        if (quizData.answers && Object.keys(quizData.answers).length === 12) {
          const { error: rpcError } = await supabase.rpc('submit_quiz_result', {
            p_answers: quizData.answers
          })
          if (rpcError) {
            console.error('RPC submit_quiz_result error:', rpcError)
            throw new Error(`Database error submitting quiz: ${rpcError.message || 'Failed to submit quiz'}`)
          }
        } else {
          const { error: upsertErr } = await supabase.from('profiles').upsert({
            id: user.id,
            working_style: quizData.workingStyle,
            top_interests: quizData.topInterests,
            secondary_interests: quizData.secondaryInterests,
            hobbies: quizData.hobbies,
            interest_scores: quizData.interestScores,
            quiz_completed: true,
            quiz_completed_at: quizData.completedAt || new Date().toISOString(),
            profile_completion: 100,
            updated_at: new Date().toISOString()
          })
          if (upsertErr) {
            console.error('Supabase profile quiz upsert error:', upsertErr)
            throw new Error(`Database error saving quiz: ${upsertErr.message || 'Failed to save quiz profile'}`)
          }
        }
      }
    }

    return updated
  },

  // 3. Get student catalog / discovery list (uses secure public_profiles view)
  async getStudents() {
    initStorage()
    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        let query = supabase.from('public_profiles').select(PUBLIC_PROFILE_FIELDS)
        if (user) {
          query = query.neq('id', user.id)
        }
        const { data, error } = await query
        if (!error && data && data.length > 0) {
          return data.map(stu => ({
            ...stu,
            fullName: stu.full_name || stu.fullName || 'Student',
            avatar: stu.avatar_url || stu.avatar || null,
            academicYear: stu.academic_year || stu.academicYear || '',
            workingStyle: stu.working_style || stu.workingStyle || '',
            status: stu.status || 'none',
            isOnline: stu.show_online_status ?? true
          }))
        }
      } catch (err) {
        console.warn('Supabase getStudents error:', err)
      }
    }

    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS)
    return raw ? JSON.parse(raw) : DEMO_PREVIEW_STUDENTS
  },

  // 3b. Fetch single student peer profile by ID (uses secure public_profiles view)
  async getStudentById(studentId) {
    initStorage()
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('public_profiles')
          .select(PUBLIC_PROFILE_FIELDS)
          .eq('id', studentId)
          .maybeSingle()
        if (!error && data) {
          return {
            ...data,
            fullName: data.full_name || data.fullName || 'Student',
            avatar: data.avatar_url || data.avatar || null,
            academicYear: data.academic_year || data.academicYear || '',
            workingStyle: data.working_style || data.workingStyle || '',
            status: data.status || 'none',
            isOnline: data.show_online_status ?? true
          }
        }
      } catch (err) {
        console.warn('Supabase getStudentById error:', err)
      }
    }
    const students = await this.getStudents()
    return students.find(s => s.id === studentId) || null
  },

  // 4. Send Friend Request (Supabase friend_requests)
  async sendFriendRequest(receiverId) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Please log in before sending a connection request.')
    }

    if (user.id === receiverId) {
      throw new Error('You cannot send a connection request to yourself.')
    }

    const { data, error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      if (error.message?.includes('already friends')) {
        throw new Error('You are already connected with this student.')
      }
      if (error.message?.includes('already exists') || error.code === '23505') {
        throw new Error('A connection request is already pending with this student.')
      }
      throw new Error(error.message || 'Failed to send friend request.')
    }

    return data
  },

  // 5. Get Connected Friends from public.friendships
  async getFriends() {
    if (!isSupabaseConfigured) return []
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return []

    const { data: friendships, error: fError } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)

    if (fError) {
      console.error('Error fetching friendships:', fError)
      throw new Error(fError.message || 'Failed to fetch friendships.')
    }

    if (!friendships || friendships.length === 0) return []

    const friendIds = friendships.map(f => f.user_id_1 === user.id ? f.user_id_2 : f.user_id_1)

    const { data: profiles, error: pError } = await supabase
      .from('public_profiles')
      .select(PUBLIC_PROFILE_FIELDS)
      .in('id', friendIds)

    if (pError) {
      console.error('Error fetching friend profiles:', pError)
      throw new Error(pError.message || 'Failed to fetch friend profiles.')
    }

    return (profiles || []).map(p => ({
      ...p,
      fullName: p.full_name || p.fullName || 'Student',
      avatar: p.avatar_url || p.avatar || null,
      academicYear: p.academic_year || p.academicYear || '',
      workingStyle: p.working_style || p.workingStyle || '',
      status: 'accepted',
      isOnline: p.show_online_status ?? true
    }))
  },

  // 6. Get Incoming Friend Requests
  async getIncomingFriendRequests() {
    if (!isSupabaseConfigured) return []
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return []

    const { data: requests, error: rError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('receiver_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (rError) {
      console.error('Error fetching incoming requests:', rError)
      throw new Error(rError.message || 'Failed to fetch incoming requests.')
    }

    if (!requests || requests.length === 0) return []

    const senderIds = requests.map(r => r.sender_id)
    const { data: profiles, error: pError } = await supabase
      .from('public_profiles')
      .select(PUBLIC_PROFILE_FIELDS)
      .in('id', senderIds)

    if (pError) {
      console.error('Error fetching requester profiles:', pError)
      throw new Error(pError.message || 'Failed to fetch requester profiles.')
    }

    const profileMap = new Map((profiles || []).map(p => [p.id, p]))

    return requests.map(r => {
      const p = profileMap.get(r.sender_id) || {}
      return {
        ...p,
        id: r.sender_id, // student ID
        requestId: r.id, // friend_requests record ID
        senderId: r.sender_id,
        receiverId: r.receiver_id,
        fullName: p.full_name || 'Student Peer',
        avatar: p.avatar_url || null,
        academicYear: p.academic_year || '',
        branch: p.branch || '',
        university: p.university || '',
        status: 'received',
        isOnline: p.show_online_status ?? true,
        createdAt: r.created_at
      }
    })
  },

  // 7. Get Sent Friend Requests
  async getSentFriendRequests() {
    if (!isSupabaseConfigured) return []
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return []

    const { data: requests, error: rError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('sender_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (rError) {
      console.error('Error fetching sent requests:', rError)
      throw new Error(rError.message || 'Failed to fetch sent requests.')
    }

    if (!requests || requests.length === 0) return []

    const receiverIds = requests.map(r => r.receiver_id)
    const { data: profiles, error: pError } = await supabase
      .from('public_profiles')
      .select(PUBLIC_PROFILE_FIELDS)
      .in('id', receiverIds)

    if (pError) {
      console.error('Error fetching recipient profiles:', pError)
      throw new Error(pError.message || 'Failed to fetch recipient profiles.')
    }

    const profileMap = new Map((profiles || []).map(p => [p.id, p]))

    return requests.map(r => {
      const p = profileMap.get(r.receiver_id) || {}
      return {
        ...p,
        id: r.receiver_id, // student ID
        requestId: r.id, // friend_requests record ID
        senderId: r.sender_id,
        receiverId: r.receiver_id,
        fullName: p.full_name || 'Student Peer',
        avatar: p.avatar_url || null,
        academicYear: p.academic_year || '',
        branch: p.branch || '',
        university: p.university || '',
        status: 'pending',
        isOnline: p.show_online_status ?? true,
        createdAt: r.created_at
      }
    })
  },

  // 8. Accept Friend Request
  async acceptFriendRequest(targetId) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Please log in before accepting a request.')
    }

    const { data: matches, error: findError } = await supabase
      .from('friend_requests')
      .select('id, sender_id, receiver_id, status')
      .eq('receiver_id', user.id)
      .eq('status', 'pending')

    if (findError) {
      throw new Error(findError.message || 'Error locating friend request.')
    }

    const requestToAccept = (matches || []).find(
      r => r.id === targetId || r.sender_id === targetId
    )

    if (!requestToAccept) {
      throw new Error('Pending friend request was not found.')
    }

    // Updating status to accepted automatically fires database trigger handle_friend_request_accepted
    // which inserts into public.friendships.
    const { data, error } = await supabase
      .from('friend_requests')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestToAccept.id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message || 'Failed to accept friend request.')
    }

    return data
  },

  // 9. Reject / Decline Friend Request
  async rejectFriendRequest(targetId) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Please log in before declining a request.')
    }

    const { data: matches, error: findError } = await supabase
      .from('friend_requests')
      .select('id, sender_id')
      .eq('receiver_id', user.id)
      .eq('status', 'pending')

    if (findError) {
      throw new Error(findError.message || 'Error locating friend request.')
    }

    const requestToReject = (matches || []).find(
      r => r.id === targetId || r.sender_id === targetId
    )

    if (!requestToReject) {
      throw new Error('Pending friend request was not found.')
    }

    const { data, error } = await supabase
      .from('friend_requests')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestToReject.id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message || 'Failed to decline friend request.')
    }

    return data
  },

  // 10. Withdraw / Cancel Pending Sent Request
  async withdrawFriendRequest(targetId) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Please log in before cancelling a request.')
    }

    const { data: matches, error: findError } = await supabase
      .from('friend_requests')
      .select('id, receiver_id')
      .eq('sender_id', user.id)
      .eq('status', 'pending')

    if (findError) {
      throw new Error(findError.message || 'Error locating friend request.')
    }

    const requestToCancel = (matches || []).find(
      r => r.id === targetId || r.receiver_id === targetId
    )

    if (!requestToCancel) {
      throw new Error('Pending sent friend request was not found.')
    }

    const { data, error } = await supabase
      .from('friend_requests')
      .update({
        status: 'withdrawn',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestToCancel.id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message || 'Failed to cancel friend request.')
    }

    return data
  },

  // 8. Get Collaboration Opportunities
  async getCollaborations() {
    return DEMO_COLLABORATIONS
  },

  // 9. Get Chat Conversations
  async getConversations() {
    if (isSupabaseConfigured) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) {
        return []
      }

      // Fetch conversations where user is participant_one or participant_two
      const { data: rawConversations, error: convErr } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

      if (convErr) {
        console.error('Supabase getConversations error:', convErr)
        return []
      }

      if (!rawConversations || rawConversations.length === 0) {
        return []
      }

      // Extract all peer IDs
      const peerIds = [...new Set(
        rawConversations.map(c => c.participant_one === user.id ? c.participant_two : c.participant_one)
      )]

      // Fetch peer public profiles using vetted public_profiles view
      const { data: peerProfiles, error: peerErr } = await supabase
        .from('public_profiles')
        .select(PUBLIC_PROFILE_FIELDS)
        .in('id', peerIds)

      if (peerErr) {
        console.warn('Could not fetch peer public profiles:', peerErr)
      }

      const peerMap = new Map((peerProfiles || []).map(p => [p.id, p]))

      // Fetch all messages for these conversations
      const convIds = rawConversations.map(c => c.id)
      const { data: rawMessages, error: msgErr } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: true })

      if (msgErr) {
        console.warn('Could not fetch messages:', msgErr)
      }

      // Group messages by conversation ID
      const messagesByConv = new Map()
      for (const msg of (rawMessages || [])) {
        if (!messagesByConv.has(msg.conversation_id)) {
          messagesByConv.set(msg.conversation_id, [])
        }
        const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        messagesByConv.get(msg.conversation_id).push({
          id: msg.id,
          conversationId: msg.conversation_id,
          senderId: msg.sender_id,
          recipientId: msg.recipient_id,
          text: msg.content,
          isRead: msg.is_read,
          createdAt: msg.created_at,
          timestamp: time
        })
      }

      return rawConversations.map(conv => {
        const peerId = conv.participant_one === user.id ? conv.participant_two : conv.participant_one
        const peer = peerMap.get(peerId) || {}
        const msgs = messagesByConv.get(conv.id) || []
        const lastMsgTime = conv.last_message_at
          ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : ''
        const unreadCount = msgs.filter(m => m.recipientId === user.id && !m.isRead).length
        const peerName = peer.full_name || peer.fullName || 'Student Peer'
        const peerBranch = [peer.branch, peer.university].filter(Boolean).join(', ')

        return {
          id: conv.id,
          participantId: peerId,
          participantName: peerName,
          participantAvatar: peer.avatar_url || null,
          participantBranch: peerBranch || 'ConnectU Student',
          isOnline: peer.show_online_status ?? true,
          unreadCount,
          lastMessage: conv.last_message_text || (msgs[msgs.length - 1]?.text ?? 'No messages yet'),
          lastMessageTime: lastMsgTime,
          messages: msgs
        }
      })
    }

    // Only for non-Supabase demo mode
    initStorage()
    const raw = localStorage.getItem(STORAGE_KEY_CHATS)
    return raw ? JSON.parse(raw) : DEMO_CONVERSATIONS
  },

  // 10. Send a Message
  async sendMessage(conversationId, text) {
    if (!text || !text.trim()) return null
    const trimmed = text.trim()

    if (isSupabaseConfigured) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) {
        throw new Error('Please log in before sending messages.')
      }

      // Fetch conversation to determine the correct recipient_id
      const { data: conv, error: convErr } = await supabase
        .from('conversations')
        .select('id, participant_one, participant_two')
        .eq('id', conversationId)
        .single()

      if (convErr || !conv) {
        throw new Error('Conversation not found or access denied.')
      }

      const recipientId = conv.participant_one === user.id ? conv.participant_two : conv.participant_one
      if (!recipientId) {
        throw new Error('Recipient could not be identified.')
      }

      // Insert into public.messages
      const { data: insertedMsg, error: msgErr } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          recipient_id: recipientId,
          content: trimmed
        })
        .select()
        .single()

      if (msgErr) {
        console.error('Failed to send message:', msgErr)
        if (msgErr.message?.includes('accepted friends') || msgErr.code === '42501') {
          throw new Error('You can only message students who are accepted connections.')
        }
        throw new Error(msgErr.message || 'Failed to send message.')
      }

      const timeString = new Date(insertedMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      return {
        id: insertedMsg.id,
        conversationId: insertedMsg.conversation_id,
        senderId: insertedMsg.sender_id,
        recipientId: insertedMsg.recipient_id,
        text: insertedMsg.content,
        isRead: insertedMsg.is_read,
        createdAt: insertedMsg.created_at,
        timestamp: timeString
      }
    }

    // Demo fallback for non-Supabase mode
    initStorage()
    const raw = localStorage.getItem(STORAGE_KEY_CHATS)
    const conversations = raw ? JSON.parse(raw) : DEMO_CONVERSATIONS

    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: 'current-user-preview',
      text: trimmed,
      timestamp: timeString
    }

    const updated = conversations.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessage: trimmed,
          lastMessageTime: timeString,
          messages: [...(c.messages || []), newMessage]
        }
      }
      return c
    })

    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(updated))
    return newMessage
  },

  // 11. Create or open conversation with student
  async openConversationWithStudent(student) {
    if (!student || !student.id) throw new Error('Invalid student')

    if (isSupabaseConfigured) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) {
        throw new Error('Please log in before opening conversations.')
      }

      if (user.id === student.id) {
        throw new Error('You cannot message yourself.')
      }

      // Canonical participant ordering: participant_one < participant_two
      const [p1, p2] = user.id < student.id ? [user.id, student.id] : [student.id, user.id]

      // Check if conversation already exists
      const { data: existingList, error: findErr } = await supabase
        .from('conversations')
        .select('*')
        .eq('participant_one', p1)
        .eq('participant_two', p2)

      let convRow = existingList && existingList.length > 0 ? existingList[0] : null

      if (!convRow) {
        const { data: newRow, error: insertErr } = await supabase
          .from('conversations')
          .insert({
            participant_one: p1,
            participant_two: p2,
            last_message_text: '',
            last_message_at: new Date().toISOString()
          })
          .select()
          .single()

        if (insertErr) {
          console.error('Create conversation error:', insertErr)
          if (insertErr.message?.includes('accepted friends') || insertErr.code === '42501') {
            throw new Error('You can only start conversations with accepted connections.')
          }
          throw new Error(insertErr.message || 'Failed to start conversation.')
        }
        convRow = newRow
      }

      // Fetch messages for this conversation
      const { data: rawMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convRow.id)
        .order('created_at', { ascending: true })

      const messages = (rawMessages || []).map(m => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        recipientId: m.recipient_id,
        text: m.content,
        isRead: m.is_read,
        createdAt: m.created_at,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }))

      const peerName = student.fullName || student.full_name || 'Student Peer'
      const peerBranch = [student.branch, student.university].filter(Boolean).join(', ')

      return {
        id: convRow.id,
        participantId: student.id,
        participantName: peerName,
        participantAvatar: student.avatar || student.avatar_url || null,
        participantBranch: peerBranch || 'ConnectU Student',
        isOnline: student.isOnline ?? true,
        unreadCount: 0,
        lastMessage: convRow.last_message_text || (messages[messages.length - 1]?.text ?? 'Started a new conversation'),
        lastMessageTime: convRow.last_message_at ? new Date(convRow.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
        messages
      }
    }

    // Demo fallback for non-Supabase mode
    initStorage()
    const conversations = await this.getConversations()
    const existing = conversations.find(c => c.participantId === student.id)
    if (existing) return existing

    const newConversation = {
      id: `conv-${Date.now()}`,
      participantId: student.id,
      participantName: student.fullName,
      participantAvatar: student.avatar,
      participantBranch: `${student.branch || ''}, ${student.university || ''}`,
      isOnline: Boolean(student.isOnline),
      unreadCount: 0,
      lastMessage: 'Started a new conversation',
      lastMessageTime: 'Just now',
      messages: []
    }

    const updated = [newConversation, ...conversations]
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(updated))
    return newConversation
  }
}
