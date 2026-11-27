import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { studentService } from '../services/studentService'
import { calculateCompatibility } from '../utils/compatibility'
import { isSupabaseConfigured, supabase } from '../services/supabase'
import { useToast } from './ToastContext'
import { useAuth } from '../hooks/useAuth'

const StudentDataContext = createContext(null)

export function StudentDataProvider({ children }) {
  const { user: authUser } = useAuth()
  const { addToast } = useToast()
  const [currentUser, setCurrentUser] = useState(authUser || null)
  const [students, setStudents] = useState([])
  const [friends, setFriends] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [collaborations, setCollaborations] = useState([])
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Synchronize currentUser whenever authUser updates from Supabase
  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser)
    }
  }, [authUser])

  // Centralized network refresh function
  const refreshNetwork = useCallback(async (activeUser = (authUser || currentUser)) => {
    try {
      const [friendList, incomingList, sentList, rawStudents] = await Promise.all([
        studentService.getFriends(),
        studentService.getIncomingFriendRequests(),
        studentService.getSentFriendRequests(),
        studentService.getStudents()
      ])

      const friendIdSet = new Set(friendList.map(f => f.id))
      const incomingSenderIdSet = new Set(incomingList.map(r => r.senderId || r.id))
      const sentReceiverIdSet = new Set(sentList.map(r => r.receiverId || r.id))

      // Enrich incoming requests with compatibility against active user
      const enrichedIncoming = incomingList.map(req => {
        const compat = calculateCompatibility(activeUser, req)
        return {
          ...req,
          compatibilityScore: compat.score,
          compatibilityReasons: compat.reasons
        }
      })

      // Enrich friends with compatibility against active user
      const enrichedFriends = friendList.map(fr => {
        const compat = calculateCompatibility(activeUser, fr)
        return {
          ...fr,
          compatibilityScore: compat.score,
          compatibilityReasons: compat.reasons
        }
      })

      // Map dynamic networking status onto all discoverable student peers
      const enrichedStudents = rawStudents.map(stu => {
        let status = 'none'
        if (friendIdSet.has(stu.id)) status = 'accepted'
        else if (sentReceiverIdSet.has(stu.id)) status = 'pending'
        else if (incomingSenderIdSet.has(stu.id)) status = 'received'

        const compat = calculateCompatibility(activeUser, stu)
        return {
          ...stu,
          status,
          compatibilityScore: compat.score,
          compatibilityReasons: compat.reasons
        }
      })

      setFriends(enrichedFriends)
      setIncomingRequests(enrichedIncoming)
      setSentRequests(sentList)
      setStudents(enrichedStudents)

      return {
        friends: enrichedFriends,
        incomingRequests: enrichedIncoming,
        sentRequests: sentList,
        students: enrichedStudents
      }
    } catch (err) {
      console.error('Error refreshing networking data:', err)
      throw err
    }
  }, [authUser, currentUser])

  // Load initial dataset for current authenticated user
  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setIsLoading(true)
      try {
        const [userProfile, collabList, chats] = await Promise.all([
          studentService.getCurrentUserProfile(),
          studentService.getCollaborations(),
          studentService.getConversations()
        ])

        if (isMounted) {
          const resolvedUser = authUser || userProfile
          setCurrentUser(resolvedUser)
          setCollaborations(collabList)
          setConversations(chats)
          if (chats.length > 0) {
            setActiveConversationId(prev => (prev && chats.some(c => c.id === prev)) ? prev : chats[0].id)
          } else {
            setActiveConversationId(null)
          }
          await refreshNetwork(resolvedUser)
        }
      } catch (err) {
        console.error('Failed to load initial student data:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [authUser?.id, refreshNetwork])

  // Realtime handler for incoming/outgoing chat messages
  const handleRealtimeMessage = useCallback((rawMsg) => {
    if (!rawMsg) return
    const activeUserId = authUser?.id || currentUser?.id
    const timeString = new Date(rawMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const formatted = {
      id: rawMsg.id,
      conversationId: rawMsg.conversation_id,
      senderId: rawMsg.sender_id,
      recipientId: rawMsg.recipient_id,
      text: rawMsg.content,
      isRead: rawMsg.is_read,
      createdAt: rawMsg.created_at,
      timestamp: timeString
    }

    setConversations(prev => {
      const convIndex = prev.findIndex(c => c.id === rawMsg.conversation_id)
      if (convIndex === -1) {
        // Unknown conversation arrived via Realtime; refresh from database
        studentService.getConversations().then(chats => {
          setConversations(chats)
        }).catch(() => {})
        return prev
      }

      const updated = [...prev]
      const targetConv = { ...updated[convIndex] }
      const existingMsgs = targetConv.messages || []
      if (existingMsgs.some(m => m.id === rawMsg.id)) {
        return prev
      }

      targetConv.messages = [...existingMsgs, formatted]
      targetConv.lastMessage = formatted.text
      targetConv.lastMessageTime = formatted.timestamp
      if (rawMsg.recipient_id === activeUserId) {
        targetConv.unreadCount = (targetConv.unreadCount || 0) + 1
      }

      // Reorder conversation to the top of list
      updated.splice(convIndex, 1)
      return [targetConv, ...updated]
    })
  }, [authUser?.id, currentUser?.id])

  // Subscribe to Supabase Realtime changes on friend_requests, friendships, messages, and conversations
  useEffect(() => {
    const activeUserId = authUser?.id || currentUser?.id
    if (!isSupabaseConfigured || !activeUserId) return

    const networkChannel = supabase
      .channel(`user-network-${activeUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
          filter: `receiver_id=eq.${activeUserId}`
        },
        () => {
          refreshNetwork(authUser || currentUser).catch(() => {})
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
          filter: `sender_id=eq.${activeUserId}`
        },
        () => {
          refreshNetwork(authUser || currentUser).catch(() => {})
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `user_id_1=eq.${activeUserId}`
        },
        () => {
          refreshNetwork(authUser || currentUser).catch(() => {})
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `user_id_2=eq.${activeUserId}`
        },
        () => {
          refreshNetwork(authUser || currentUser).catch(() => {})
        }
      )
      .subscribe()

    const chatChannel = supabase
      .channel(`user-chat-${activeUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${activeUserId}`
        },
        (payload) => {
          handleRealtimeMessage(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${activeUserId}`
        },
        (payload) => {
          handleRealtimeMessage(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          studentService.getConversations().then(chats => {
            setConversations(chats)
          }).catch(() => {})
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(networkChannel)
      supabase.removeChannel(chatChannel)
    }
  }, [authUser?.id, currentUser?.id, refreshNetwork, handleRealtimeMessage])

  // Active conversation object
  const activeConversation = useMemo(() => {
    return conversations.find(c => c.id === activeConversationId) || conversations[0] || null
  }, [conversations, activeConversationId])

  // Friend actions
  const sendFriendRequest = async (studentId) => {
    try {
      const target = students.find(s => s.id === studentId)
      await studentService.sendFriendRequest(studentId)
      await refreshNetwork(currentUser)
      addToast(`Connection request sent to ${target?.fullName || 'student'}`, 'success')
    } catch (err) {
      console.error('Send friend request failed:', err)
      addToast(err.message || 'Failed to send friend request', 'error')
      throw err
    }
  }

  const acceptFriendRequest = async (targetId) => {
    try {
      const target =
        incomingRequests.find(r => r.id === targetId || r.requestId === targetId) ||
        students.find(s => s.id === targetId)
      await studentService.acceptFriendRequest(targetId)
      await refreshNetwork(currentUser)
      addToast(`You and ${target?.fullName || 'student'} are now connected!`, 'success')
    } catch (err) {
      console.error('Accept friend request failed:', err)
      addToast(err.message || 'Failed to accept friend request', 'error')
      throw err
    }
  }

  const rejectFriendRequest = async (targetId) => {
    try {
      const target =
        incomingRequests.find(r => r.id === targetId || r.requestId === targetId) ||
        students.find(s => s.id === targetId)
      await studentService.rejectFriendRequest(targetId)
      await refreshNetwork(currentUser)
      addToast(`Declined request from ${target?.fullName || 'student'}`, 'info')
    } catch (err) {
      console.error('Reject friend request failed:', err)
      addToast(err.message || 'Failed to decline friend request', 'error')
      throw err
    }
  }

  const withdrawFriendRequest = async (targetId) => {
    try {
      const target =
        sentRequests.find(r => r.id === targetId || r.requestId === targetId) ||
        students.find(s => s.id === targetId)
      await studentService.withdrawFriendRequest(targetId)
      await refreshNetwork(currentUser)
      addToast(`Cancelled request to ${target?.fullName || 'student'}`, 'info')
    } catch (err) {
      console.error('Withdraw friend request failed:', err)
      addToast(err.message || 'Failed to cancel friend request', 'error')
      throw err
    }
  }

  // Profile actions
  const updateProfile = async (updates) => {
    try {
      const updated = await studentService.updateProfile(updates)
      setCurrentUser(updated)
      await refreshNetwork(updated)
      addToast('Profile updated successfully', 'success')
      return updated
    } catch (err) {
      console.error('Profile update failed:', err)
      addToast(err.message || 'Failed to update profile', 'error')
      throw err
    }
  }

  // Quiz completion
  const saveQuizResult = async (quizData) => {
    try {
      const updated = await studentService.saveQuizProfile(quizData)
      setCurrentUser(updated)
      await refreshNetwork(updated)
      addToast(`Interest profile saved: '${quizData.workingStyle}'!`, 'success')
      return updated
    } catch (err) {
      console.error('Save quiz profile failed:', err)
      addToast(err.message || 'Failed to save quiz profile', 'error')
      throw err
    }
  }

  // Chat actions
  const sendMessage = async (conversationId, text) => {
    if (!text.trim()) return
    const newMsg = await studentService.sendMessage(conversationId, text.trim())
    if (newMsg) {
      setConversations(prev => {
        const convIndex = prev.findIndex(c => c.id === conversationId)
        if (convIndex === -1) return prev
        const updated = [...prev]
        const targetConv = { ...updated[convIndex] }
        const msgs = targetConv.messages || []
        const exists = msgs.some(m => m.id === newMsg.id)
        targetConv.messages = exists ? msgs : [...msgs, newMsg]
        targetConv.lastMessage = newMsg.text
        targetConv.lastMessageTime = newMsg.timestamp
        updated.splice(convIndex, 1)
        return [targetConv, ...updated]
      })
    }
    return newMsg
  }

  const startChatWithStudent = async (student) => {
    const conv = await studentService.openConversationWithStudent(student)
    setConversations(prev => {
      if (prev.some(c => c.id === conv.id)) return prev
      return [conv, ...prev]
    })
    setActiveConversationId(conv.id)
    return conv
  }

  const value = {
    currentUser,
    students,
    friends,
    incomingRequests,
    sentRequests,
    collaborations,
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    isLoading,
    refreshNetwork,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    withdrawFriendRequest,
    updateProfile,
    saveQuizResult,
    sendMessage,
    startChatWithStudent
  }

  return <StudentDataContext.Provider value={value}>{children}</StudentDataContext.Provider>
}

export function useStudentData() {
  const context = useContext(StudentDataContext)
  if (!context) {
    throw new Error('useStudentData must be used within a StudentDataProvider')
  }
  return context
}
