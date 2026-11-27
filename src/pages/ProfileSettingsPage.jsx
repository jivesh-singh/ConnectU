import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User,
  Wrench,
  Heart,
  Shield,
  KeyRound,
  LogOut,
  Save,
  Plus,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Avatar } from '../components/common/Avatar'
import { useAuth } from '../hooks/useAuth'
import { useStudentData } from '../hooks/useStudentData'
import { useToast } from '../hooks/useToast'
import { POPULAR_SKILLS, INTEREST_CATEGORIES, ACADEMIC_YEARS } from '../utils/constants'

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
]

export function ProfileSettingsPage() {
  const { user, logout, isSupabaseConfigured } = useAuth()
  const { updateProfile } = useStudentData()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('profile')
  const [copiedEnv, setCopiedEnv] = useState(false)

  const userMeta = user?.user_metadata || {}
  const defaultFullName =
    userMeta.full_name ||
    userMeta.name ||
    user?.full_name ||
    user?.fullName ||
    user?.name ||
    user?.email ||
    'Student'

  const defaultAvatar =
    userMeta.avatar_url ||
    userMeta.picture ||
    user?.avatar_url ||
    user?.picture ||
    user?.avatar ||
    AVATAR_OPTIONS[0]

  const [profileForm, setProfileForm] = useState({
    fullName: defaultFullName,
    avatar: defaultAvatar,
    university: user?.university || 'Stanford University',
    college: user?.college || 'School of Engineering',
    branch: user?.branch || 'Computer Science',
    academicYear: user?.academicYear || '3rd Year',
    semester: user?.semester || '6th Semester',
    bio: user?.bio || 'Building human-centered AI interfaces and interactive web tools. Passionate about participating in national hackathons and open-source accessibility.',
    skills: user?.skills || ['React', 'TypeScript', 'Tailwind CSS', 'Python', 'UI/UX Design', 'PyTorch'],
    interests: user?.interests || ['Technology', 'AI and ML', 'Design', 'Entrepreneurship', 'Research'],
    privacy: {
      isPublic: true,
      showOnlineStatus: true,
      allowDirectMessages: true
    }
  })

  const [newSkillText, setNewSkillText] = useState('')

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileForm)
    } catch (err) {
      // Error toast is surfaced by StudentDataContext
    }
  }

  const toggleInterest = (interest) => {
    setProfileForm(prev => {
      const exists = prev.interests.includes(interest)
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter(i => i !== interest)
          : [...prev.interests, interest]
      }
    })
  }

  const removeSkill = (skillToRemove) => {
    setProfileForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }))
  }

  const addCustomSkill = () => {
    const trimmed = newSkillText.trim()
    if (trimmed && !profileForm.skills.includes(trimmed)) {
      setProfileForm(prev => ({
        ...prev,
        skills: [...prev.skills, trimmed]
      }))
      setNewSkillText('')
    }
  }

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(`VITE_SUPABASE_URL=https://your-project-ref.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key-here`)
    setCopiedEnv(true)
    addToast('Copied .env template to clipboard', 'success')
    setTimeout(() => setCopiedEnv(false), 2500)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const tabs = [
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'skills', label: 'Skills & Stack', icon: Wrench },
    { id: 'interests', label: 'Interests & Quiz', icon: Heart },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'supabase', label: 'Supabase Config', icon: KeyRound },
  ]

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cu-text-subtle">
            Account Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292724] tracking-tight">
            Profile & Settings
          </h1>
          <p className="text-sm text-cu-text-muted mt-0.5">
            Keep your academic identity and matching criteria up to date.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" icon={Save} onClick={handleSaveProfile}>
            Save Changes
          </Button>
          <Button variant="ghost" size="sm" icon={LogOut} onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </div>

      {/* Settings Tabs Bar */}
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
                  : 'text-cu-text-muted hover:text-cu-text-main hover:bg-[rgba(255,255,255,0.4)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: EDIT PROFILE */}
      {activeTab === 'profile' && (
        <Card variant="glass" className="p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-lg font-bold text-cu-text-main">Personal Information</h3>
            <p className="text-xs text-cu-text-muted mt-0.5">
              Update how other campus peers view your profile across the network.
            </p>
          </div>

          {/* Avatar selector */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-cu-text-muted">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              <Avatar src={profileForm.avatar} name={profileForm.fullName} size="xl" isOnline={true} />
              <div className="space-y-1.5">
                <span className="text-xs text-cu-text-muted block">Choose an avatar preset:</span>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, avatar: url })}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 ${
                        profileForm.avatar === url ? 'border-[#292724] ring-2 ring-cu-accent scale-105' : 'border-transparent opacity-75'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
            />
            <Input
              label="University"
              value={profileForm.university}
              onChange={(e) => setProfileForm({ ...profileForm, university: e.target.value })}
            />
            <Input
              label="Faculty / College"
              value={profileForm.college}
              onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
            />
            <Input
              label="Major / Branch"
              value={profileForm.branch}
              onChange={(e) => setProfileForm({ ...profileForm, branch: e.target.value })}
            />
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold uppercase tracking-wider text-cu-text-muted">
                Academic Year
              </label>
              <select
                value={profileForm.academicYear}
                onChange={(e) => setProfileForm({ ...profileForm, academicYear: e.target.value })}
                className="w-full bg-[rgba(255,255,255,0.65)] backdrop-blur-md border border-[rgba(227,213,202,0.85)] rounded-xl px-3.5 py-2.5 text-sm text-cu-text-main focus:outline-none focus:border-[#292724]"
              >
                {ACADEMIC_YEARS.map(y => (
                  <option key={y} value={y.split(' ')[0] + ' ' + y.split(' ')[1]}>{y}</option>
                ))}
              </select>
            </div>
            <Input
              label="Semester"
              value={profileForm.semester}
              onChange={(e) => setProfileForm({ ...profileForm, semester: e.target.value })}
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-cu-text-muted">
              Short Bio
            </label>
            <textarea
              rows={4}
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              className="w-full bg-[rgba(255,255,255,0.65)] backdrop-blur-md border border-[rgba(227,213,202,0.85)] rounded-xl p-3.5 text-sm text-cu-text-main focus:outline-none focus:border-[#292724]"
            />
          </div>
        </Card>
      )}

      {/* TAB 2: SKILLS & STACK */}
      {activeTab === 'skills' && (
        <Card variant="glass" className="p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-lg font-bold text-cu-text-main">Skills & Tech Stack</h3>
            <p className="text-xs text-cu-text-muted mt-0.5">
              Specify your strengths to match with teams that need your skills.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-cu-text-muted">
              Current Skills ({profileForm.skills.length})
            </label>
            <div className="flex flex-wrap gap-2 p-4 bg-[rgba(255,255,255,0.45)] backdrop-blur-sm rounded-2xl border border-[rgba(255,255,255,0.65)] min-h-[50px]">
              {profileForm.skills.map(skill => (
                <Badge
                  key={skill}
                  variant="glass"
                  size="md"
                  onRemove={() => removeSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-cu-text-muted">
              Add a Skill
            </label>
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                placeholder="e.g. Next.js, Kubernetes, Swift..."
                value={newSkillText}
                onChange={(e) => setNewSkillText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomSkill()
                  }
                }}
                className="flex-1 bg-[rgba(255,255,255,0.65)] backdrop-blur-sm border border-[rgba(227,213,202,0.8)] rounded-xl px-3.5 py-2 text-sm text-cu-text-main focus:outline-none focus:border-[#292724]"
              />
              <Button variant="secondary" size="md" icon={Plus} onClick={addCustomSkill}>
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-cu-text-muted">
              Quick Suggestions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SKILLS.map(skill => {
                const hasSkill = profileForm.skills.includes(skill)
                if (hasSkill) return null
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setProfileForm(p => ({ ...p, skills: [...p.skills, skill] }))}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[rgba(255,255,255,0.6)] bg-[rgba(255,255,255,0.45)] text-cu-text-muted hover:text-cu-text-main hover:bg-[rgba(245,235,224,0.7)] transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{skill}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: INTERESTS & QUIZ */}
      {activeTab === 'interests' && (
        <Card variant="glass" className="p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-lg font-bold text-cu-text-main">Interests & Archetype</h3>
            <p className="text-xs text-cu-text-muted mt-0.5">
              Manage your passion topics and review your calibrated quiz archetype.
            </p>
          </div>

          {/* Current Quiz Interest Profile Summary Banner */}
          <div className="p-6 rounded-[22px] bg-white/70 backdrop-blur-md border border-white/80 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cu-text-subtle">
                Calibrated Interest Profile
              </span>
              <Link to="/quiz">
                <Button variant="outline" size="sm" icon={RefreshCw}>
                  Retake Quiz
                </Button>
              </Link>
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-[#292724]">
                {user?.quizResult?.workingStyle || user?.quizResult?.archetype || 'Technical Builder'}
              </h4>
              <p className="text-xs text-cu-text-muted mt-0.5">
                {user?.quizResult?.workingStyleData?.tagline || 'Translates ambitious ideas into scalable code and functional products.'}
              </p>
            </div>

            {/* Top Interests & Hobbies Badges */}
            {user?.quizResult?.topInterests && (
              <div className="pt-2 border-t border-[rgba(227,213,202,0.6)] space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cu-text-subtle">Top Interests:</span>
                  {user.quizResult.topInterests.slice(0, 3).map(interest => (
                    <span key={interest} className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-[rgba(213,189,175,0.4)] text-cu-text-main">
                      {interest}
                    </span>
                  ))}
                </div>
                {user.quizResult.hobbies && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cu-text-subtle">Hobbies:</span>
                    {user.quizResult.hobbies.map(hobby => (
                      <span key={hobby} className="text-xs font-medium px-2 py-0.5 rounded-lg bg-white/80 text-cu-text-muted border border-white">
                        {hobby}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-cu-text-muted">
              Selected Interests
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INTEREST_CATEGORIES.filter(c => c !== 'All').map(interest => {
                const isSelected = profileForm.interests.includes(interest)
                return (
                  <div
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#292724] text-[#F5EBE0] border-[#292724] font-medium shadow-xs'
                        : 'bg-[rgba(255,255,255,0.55)] border-[rgba(255,255,255,0.7)] text-cu-text-main hover:bg-[rgba(245,235,224,0.6)]'
                    }`}
                  >
                    <span className="text-xs font-semibold">{interest}</span>
                    <span className="text-xs">{isSelected ? '✓' : '+'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: PRIVACY & SECURITY */}
      {activeTab === 'privacy' && (
        <Card variant="glass" className="p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-lg font-bold text-cu-text-main">Privacy Controls</h3>
            <p className="text-xs text-cu-text-muted mt-0.5">
              Control visibility and permissions on your campus profile.
            </p>
          </div>

          <div className="space-y-4 divide-y divide-[rgba(227,213,202,0.6)]">
            <div className="pt-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-cu-text-main">Campus Discovery Visibility</p>
                <p className="text-xs text-cu-text-muted">Allow students in your university to discover your profile in search.</p>
              </div>
              <input
                type="checkbox"
                checked={profileForm.privacy.isPublic}
                onChange={(e) => setProfileForm({
                  ...profileForm,
                  privacy: { ...profileForm.privacy, isPublic: e.target.checked }
                })}
                className="w-4 h-4 accent-[#292724]"
              />
            </div>

            <div className="pt-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-cu-text-main">Show Online Activity Status</p>
                <p className="text-xs text-cu-text-muted">Display a green online indicator when you are using the app.</p>
              </div>
              <input
                type="checkbox"
                checked={profileForm.privacy.showOnlineStatus}
                onChange={(e) => setProfileForm({
                  ...profileForm,
                  privacy: { ...profileForm.privacy, showOnlineStatus: e.target.checked }
                })}
                className="w-4 h-4 accent-[#292724]"
              />
            </div>

            <div className="pt-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-cu-text-main">Direct Messages</p>
                <p className="text-xs text-cu-text-muted">Permit accepted contacts to initiate direct chat and voice rooms.</p>
              </div>
              <input
                type="checkbox"
                checked={profileForm.privacy.allowDirectMessages}
                onChange={(e) => setProfileForm({
                  ...profileForm,
                  privacy: { ...profileForm.privacy, allowDirectMessages: e.target.checked }
                })}
                className="w-4 h-4 accent-[#292724]"
              />
            </div>
          </div>
        </Card>
      )}

      {/* TAB 5: SUPABASE CONFIGURATION */}
      {activeTab === 'supabase' && (
        <Card variant="glass" className="p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-cu-text-main flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-cu-accent" />
                Supabase Backend Setup
              </h3>
              <p className="text-xs text-cu-text-muted mt-0.5">
                Centralized environment credentials for production auth and database tables.
              </p>
            </div>
            <Badge variant={isSupabaseConfigured ? 'success' : 'warning'} size="md">
              {isSupabaseConfigured ? 'Connected' : 'Interactive Preview Mode'}
            </Badge>
          </div>

          <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.6)] backdrop-blur-sm border border-[rgba(255,255,255,0.7)] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cu-text-subtle">
              How to Connect Your Supabase Project:
            </h4>
            <ol className="text-xs text-cu-text-main space-y-2 list-decimal list-inside leading-relaxed">
              <li>Create a free project at <span className="font-semibold">supabase.com</span>.</li>
              <li>Go to <span className="font-semibold">Project Settings → API</span>.</li>
              <li>Copy your <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-cu-border">Project URL</span> and <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-cu-border">anon / public key</span>.</li>
              <li>Paste them into your local <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-cu-border">.env</span> file in the project root.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cu-text-subtle">
                .env.example Format
              </span>
              <button
                onClick={copyEnvSnippet}
                className="text-xs font-semibold text-cu-text-main hover:underline flex items-center gap-1"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5 text-cu-success" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedEnv ? 'Copied!' : 'Copy Template'}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#292724] text-[#F5EBE0] font-mono text-xs overflow-x-auto leading-relaxed border border-[rgba(255,255,255,0.2)]">
{`# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`}
            </pre>
          </div>
        </Card>
      )}

    </div>
  )
}
