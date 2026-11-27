import React, { useState, useRef, useEffect } from 'react'
import {
  MessageSquare,
  Send,
  Phone,
  Search,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react'
import { Card } from '../components/common/Card'
import { Avatar } from '../components/common/Avatar'
import { Button } from '../components/common/Button'
import { useStudentData } from '../hooks/useStudentData'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { useVoiceCall } from '../hooks/useVoiceCall'

export function MessagesPage() {
  const { user } = useAuth()
  const {
    currentUser,
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    sendMessage
  } = useStudentData()

  const { addToast } = useToast()
  const { initiateCall } = useVoiceCall()
  const [inputText, setInputText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSending, setIsSending] = useState(false)

  const activeUser = user || currentUser
  const currentUserId = activeUser?.id
  const userMeta = activeUser?.user_metadata || {}
  const currentUserName =
    userMeta.full_name ||
    userMeta.name ||
    activeUser?.full_name ||
    activeUser?.fullName ||
    activeUser?.name ||
    activeUser?.email ||
    'Student'

  const currentUserAvatar =
    userMeta.avatar_url ||
    userMeta.picture ||
    activeUser?.avatar_url ||
    activeUser?.picture ||
    activeUser?.avatar ||
    null

  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages])

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!inputText.trim() || !activeConversation || isSending) return

    const textToSend = inputText
    setInputText('')
    setIsSending(true)
    try {
      await sendMessage(activeConversation.id, textToSend)
    } catch (err) {
      console.error('Send message error:', err)
      addToast(err.message || 'Failed to send message', 'error')
      setInputText(textToSend)
    } finally {
      setIsSending(false)
    }
  }

  const startVoiceCall = () => {
    if (!activeConversation) return
    const receiverId = activeConversation.participantId
    if (!receiverId) {
      addToast('Cannot start call: Peer ID is unavailable for this conversation.', 'error')
      return
    }

    initiateCall(
      receiverId,
      activeConversation.id,
      {
        id: receiverId,
        fullName: activeConversation.participantName,
        avatar: activeConversation.participantAvatar,
        branch: activeConversation.participantBranch
      }
    )
  }

  const filteredConversations = conversations.filter(c =>
    (c.participantName || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-8.5rem)] md:h-[calc(100vh-5.5rem)] flex flex-col pb-4">
      
      {/* Messages Layout Container with Glassmorphism */}
      <div className="flex-1 glass-panel overflow-hidden flex flex-col md:flex-row min-h-0 shadow-glass border border-[rgba(255,255,255,0.65)]">
        
        {/* LEFT COLUMN: CONVERSATION LIST */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-[rgba(227,213,202,0.6)] flex flex-col bg-[rgba(245,235,224,0.4)] backdrop-blur-md flex-shrink-0 ${
            activeConversation ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Search with Current Authenticated User Profile */}
          <div className="p-4 border-b border-[rgba(227,213,202,0.6)] space-y-3 bg-[rgba(255,255,255,0.4)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar
                  src={currentUserAvatar}
                  name={currentUserName}
                  size="sm"
                  isOnline={true}
                  className="ring-1 ring-white flex-shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[#292724] truncate leading-tight">
                    {currentUserName}
                  </h2>
                  <p className="text-[10px] font-semibold text-cu-text-subtle truncate">
                    {conversations.length} {conversations.length === 1 ? 'Conversation' : 'Conversations'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[rgba(214,204,194,0.5)] text-cu-text-main border border-[rgba(255,255,255,0.6)] flex-shrink-0">
                Messages
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-cu-text-subtle absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.6)] backdrop-blur-sm border border-[rgba(227,213,202,0.7)] rounded-xl pl-9 pr-3 py-2 text-xs text-cu-text-main focus:outline-none focus:border-[#292724] focus:bg-white"
              />
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[rgba(227,213,202,0.4)]">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-cu-text-muted space-y-2">
                <p className="font-semibold text-cu-text-main">No conversations yet</p>
                <p className="text-[11px] text-cu-text-subtle">
                  Connect with students in Discover or Network to start messaging.
                </p>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isActive = conv.id === activeConversationId
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[rgba(255,255,255,0.65)] border-l-4 border-[#292724] shadow-xs'
                        : 'hover:bg-[rgba(255,255,255,0.35)]'
                    }`}
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
                      <p className="text-[11px] text-cu-text-muted truncate mt-0.5">
                        {conv.participantBranch}
                      </p>
                      <p className="text-xs text-cu-text-main truncate mt-1 font-medium">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#292724] flex-shrink-0 mt-1" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CHAT WINDOW */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col bg-[rgba(255,255,255,0.55)] backdrop-blur-md min-w-0">
            
            {/* Chat Topbar */}
            <div className="p-4 border-b border-[rgba(227,213,202,0.6)] flex items-center justify-between gap-3 bg-[rgba(245,235,224,0.5)] backdrop-blur-lg">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-1.5 rounded-lg text-cu-text-muted hover:bg-[rgba(214,204,194,0.3)]"
                  aria-label="Back to threads"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <Avatar
                  src={activeConversation.participantAvatar}
                  name={activeConversation.participantName}
                  size="md"
                  isOnline={activeConversation.isOnline}
                />

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-cu-text-main truncate">
                    {activeConversation.participantName}
                  </h3>
                  <p className="text-xs text-cu-text-muted truncate flex items-center gap-1.5">
                    <span>{activeConversation.participantBranch}</span>
                    <span className="text-[10px] text-cu-success font-medium">
                      {activeConversation.isOnline ? '• Online' : '• Offline'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Buttons: Voice Calling */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  icon={Phone}
                  onClick={startVoiceCall}
                  className="hover:border-[#292724] hover:bg-[#292724] hover:text-[#F5EBE0]"
                >
                  Voice Room
                </Button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[rgba(237,237,233,0.3)]">
              
              <div className="text-center my-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(255,255,255,0.7)] backdrop-blur-sm border border-[rgba(255,255,255,0.8)] text-[11px] text-cu-text-subtle font-medium shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-cu-success" />
                  Peer-to-peer encrypted messaging • Supabase Realtime active
                </span>
              </div>

              {/* Message History */}
              {(activeConversation.messages || []).map((msg) => {
                const isMe = Boolean(currentUserId && msg.senderId === currentUserId) || msg.senderId === 'current-user-preview'
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md sm:max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-[#292724] text-[#F5EBE0] rounded-br-none'
                          : 'bg-[rgba(255,255,255,0.85)] text-cu-text-main border border-[rgba(255,255,255,0.9)] rounded-bl-none shadow-soft'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-cu-text-subtle mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form
              onSubmit={handleSend}
              className="p-3 sm:p-4 border-t border-[rgba(227,213,202,0.6)] bg-[rgba(245,235,224,0.45)] backdrop-blur-md flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={`Message ${activeConversation.participantName}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[rgba(255,255,255,0.75)] backdrop-blur-sm border border-[rgba(227,213,202,0.8)] rounded-xl px-4 py-2.5 text-sm text-cu-text-main placeholder:text-cu-text-subtle focus:outline-none focus:border-[#292724] focus:bg-white"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={Send}
                disabled={!inputText.trim() || isSending}
              >
                Send
              </Button>
            </form>

          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center p-8 text-center bg-[rgba(255,255,255,0.4)]">
            <div className="max-w-xs space-y-2">
              <MessageSquare className="w-10 h-10 text-cu-text-subtle mx-auto" />
              <h3 className="text-base font-bold text-cu-text-main">No conversation selected</h3>
              <p className="text-xs text-cu-text-muted">
                Choose a conversation from the sidebar or find a new teammate in Discover to start chatting.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
