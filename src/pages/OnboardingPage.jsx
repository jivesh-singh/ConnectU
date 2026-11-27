import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  GraduationCap,
  Wrench,
  Heart,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus
} from 'lucide-react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Badge } from '../components/common/Badge'
import { Avatar } from '../components/common/Avatar'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { ACADEMIC_YEARS, INTEREST_CATEGORIES, COLLABORATION_TYPES, POPULAR_SKILLS } from '../utils/constants'

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
]

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const { user, completeOnboarding } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const userMeta = user?.user_metadata || {}
  const defaultFullName =
    userMeta.full_name ||
    userMeta.name ||
    user?.full_name ||
    user?.fullName ||
    user?.name ||
    ''

  const defaultEmail = user?.email || userMeta.email || ''

  const defaultAvatar =
    userMeta.avatar_url ||
    userMeta.picture ||
    user?.avatar_url ||
    user?.picture ||
    user?.avatar ||
    AVATAR_PRESETS[0]

  // Form State across all 5 steps
  const [formData, setFormData] = useState({
    fullName: defaultFullName || 'Student Member',
    collegeEmail: defaultEmail || 'student@campus.edu',
    university: user?.university || 'Stanford University',
    avatar: defaultAvatar,
    college: user?.college || 'School of Engineering',
    branch: user?.branch || 'Computer Science',
    academicYear: user?.academicYear || '3rd Year',
    semester: user?.semester || '5th Semester',
    skills: user?.skills || ['React', 'TypeScript', 'Python', 'Tailwind CSS'],
    newSkillInput: '',
    interests: user?.interests || ['Technology', 'AI and ML', 'Design', 'Entrepreneurship'],
    bio: user?.bio || 'Curious builder focused on modern web apps and AI-assisted workflows. Looking for hackathon partners and co-founders.',
    collaborationPreferences: user?.collaborationPreferences || ['Hackathons', 'Startup Projects']
  })

  const [errors, setErrors] = useState({})

  const validateStep = (step) => {
    const errs = {}
    if (step === 1) {
      if (!formData.fullName.trim()) errs.fullName = 'Full name is required'
      if (!formData.collegeEmail.trim()) errs.collegeEmail = 'College email is required'
      if (!formData.university.trim()) errs.university = 'University name is required'
    } else if (step === 2) {
      if (!formData.branch.trim()) errs.branch = 'Branch/Major is required'
      if (!formData.academicYear) errs.academicYear = 'Academic year is required'
    } else if (step === 3) {
      if (formData.skills.length === 0) errs.skills = 'Select or add at least one skill'
    } else if (step === 4) {
      if (formData.interests.length === 0) errs.interests = 'Select at least one interest'
    } else if (step === 5) {
      if (!formData.bio.trim()) errs.bio = 'Please add a brief bio'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(prev => prev + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      await completeOnboarding(formData)
      addToast('Profile registration complete! Welcome to ConnectU.', 'success')
      navigate('/dashboard')
    } catch (err) {
      addToast('Failed to save profile. Please try again.', 'error')
    }
  }

  const toggleItem = (field, item) => {
    setFormData(prev => {
      const currentList = prev[field] || []
      const exists = currentList.includes(item)
      return {
        ...prev,
        [field]: exists ? currentList.filter(i => i !== item) : [...currentList, item]
      }
    })
  }

  const addCustomSkill = () => {
    const trimmed = formData.newSkillInput.trim()
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, trimmed],
        newSkillInput: ''
      }))
    }
  }

  const stepsMeta = [
    { number: 1, title: 'Personal Details', icon: User },
    { number: 2, title: 'Academic', icon: GraduationCap },
    { number: 3, title: 'Skills', icon: Wrench },
    { number: 4, title: 'Interests', icon: Heart },
    { number: 5, title: 'Introduction', icon: FileText },
  ]

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      
      {/* Step Indicator Header with Glass Styling */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-cu-text-subtle">
            Step {currentStep} of 5
          </span>
          <span className="text-xs font-semibold text-[#292724]">
            {stepsMeta[currentStep - 1].title}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-[rgba(214,204,194,0.4)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#292724] transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* Steps Chips */}
        <div className="hidden sm:grid grid-cols-5 gap-2 mt-4 text-center">
          {stepsMeta.map(s => {
            const isDone = s.number < currentStep
            const isCurrent = s.number === currentStep
            return (
              <div
                key={s.number}
                className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-colors ${
                  isCurrent
                    ? 'bg-[#292724] border-[#292724] text-[#F5EBE0] font-bold shadow-xs'
                    : isDone
                    ? 'bg-[rgba(214,204,194,0.4)] border-[rgba(255,255,255,0.6)] text-cu-text-muted'
                    : 'border-transparent text-cu-text-subtle'
                }`}
              >
                {s.title}
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Multi-Step Form Card with Glassmorphism */}
      <Card variant="glass" className="p-6 sm:p-10 shadow-glass-lg space-y-8 border border-[rgba(255,255,255,0.7)]">
        
        {/* STEP 1: PERSONAL DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-bold text-cu-text-main tracking-tight">Personal Details</h2>
              <p className="text-sm text-cu-text-muted mt-1">
                Tell us your name, college email, and choose a profile picture.
              </p>
            </div>

            {/* Profile Picture Selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-cu-text-muted">
                Profile Photo
              </label>
              <div className="flex items-center gap-4">
                <Avatar src={formData.avatar} name={formData.fullName} size="xl" />
                <div className="space-y-1.5">
                  <span className="text-xs text-cu-text-muted block">Select an avatar preset:</span>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_PRESETS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar: url })}
                        className={`rounded-full overflow-hidden w-9 h-9 border-2 transition-transform hover:scale-105 ${
                          formData.avatar === url ? 'border-[#292724] scale-105 ring-2 ring-cu-accent' : 'border-transparent opacity-80'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Input
              label="Full Name"
              placeholder="e.g. Alex Morgan"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              error={errors.fullName}
            />

            <Input
              label="College Email (.edu)"
              type="email"
              placeholder="e.g. alex@stanford.edu"
              value={formData.collegeEmail}
              onChange={(e) => setFormData({ ...formData, collegeEmail: e.target.value })}
              error={errors.collegeEmail}
              helperText="Used for institutional verification on campus"
            />

            <Input
              label="University / Institution Name"
              placeholder="e.g. Stanford University"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              error={errors.university}
            />
          </div>
        )}

        {/* STEP 2: ACADEMIC DETAILS */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-bold text-cu-text-main tracking-tight">Academic Details</h2>
              <p className="text-sm text-cu-text-muted mt-1">
                Help other students understand your curriculum stage and academic discipline.
              </p>
            </div>

            <Input
              label="Faculty / College"
              placeholder="e.g. School of Engineering"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
            />

            <Input
              label="Branch / Major"
              placeholder="e.g. Computer Science, Mechanical Engineering, HCI"
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              error={errors.branch}
            />

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-cu-text-muted">
                Academic Year
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ACADEMIC_YEARS.map(year => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setFormData({ ...formData, academicYear: year.split(' ')[0] + ' ' + year.split(' ')[1] })}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition-all ${
                      formData.academicYear.startsWith(year.split(' ')[0])
                        ? 'bg-[#292724] text-[#F5EBE0] border-[#292724] font-bold shadow-xs'
                        : 'bg-[rgba(255,255,255,0.6)] border-[rgba(255,255,255,0.7)] text-cu-text-main hover:bg-[rgba(245,235,224,0.6)]'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Current Semester"
              placeholder="e.g. 5th Semester / Fall Term"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            />
          </div>
        )}

        {/* STEP 3: SKILLS */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-bold text-cu-text-main tracking-tight">Skills & Technical Strengths</h2>
              <p className="text-sm text-cu-text-muted mt-1">
                Select your programming languages, frameworks, design tools, or add custom skills.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-cu-text-muted">
                Popular Student Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SKILLS.map(skill => {
                  const isSelected = formData.skills.includes(skill)
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleItem('skills', skill)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-[#292724] text-[#F5EBE0] border-[#292724] font-semibold shadow-xs'
                          : 'bg-[rgba(255,255,255,0.6)] border-[rgba(255,255,255,0.7)] text-cu-text-main hover:bg-[rgba(245,235,224,0.6)]'
                      }`}
                    >
                      {skill} {isSelected && '✓'}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Add Custom Skill */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-cu-text-muted">
                Add Custom Skill
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. GraphQL, Blender, Solidity, Next.js"
                  value={formData.newSkillInput}
                  onChange={(e) => setFormData({ ...formData, newSkillInput: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCustomSkill()
                    }
                  }}
                  className="flex-1 bg-[rgba(255,255,255,0.7)] border border-[rgba(227,213,202,0.85)] rounded-xl px-3.5 py-2.5 text-sm text-cu-text-main focus:outline-none focus:border-[#292724]"
                />
                <Button variant="secondary" size="md" icon={Plus} onClick={addCustomSkill}>
                  Add
                </Button>
              </div>
            </div>

            {/* Selected Skills */}
            <div>
              <span className="text-xs text-cu-text-subtle font-medium block mb-2">
                Your selected skills ({formData.skills.length}):
              </span>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-xl bg-[rgba(255,255,255,0.5)] border border-[rgba(255,255,255,0.65)]">
                {formData.skills.length === 0 ? (
                  <span className="text-xs text-cu-text-subtle">No skills selected yet.</span>
                ) : (
                  formData.skills.map(skill => (
                    <Badge
                      key={skill}
                      variant="glass"
                      size="md"
                      onRemove={() => toggleItem('skills', skill)}
                    >
                      {skill}
                    </Badge>
                  ))
                )}
              </div>
              {errors.skills && <p className="text-xs text-red-600 mt-1">{errors.skills}</p>}
            </div>
          </div>
        )}

        {/* STEP 4: INTERESTS */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-bold text-cu-text-main tracking-tight">Interests & Passions</h2>
              <p className="text-sm text-cu-text-muted mt-1">
                What domains get you excited outside lectures? This directly trains your matching engine.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INTEREST_CATEGORIES.filter(c => c !== 'All').map(interest => {
                const isSelected = formData.interests.includes(interest)
                return (
                  <div
                    key={interest}
                    onClick={() => toggleItem('interests', interest)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#292724] text-[#F5EBE0] border-[#292724] font-bold shadow-xs'
                        : 'bg-[rgba(255,255,255,0.6)] border-[rgba(255,255,255,0.7)] text-cu-text-main hover:bg-[rgba(245,235,224,0.6)]'
                    }`}
                  >
                    <span className="text-sm font-semibold">{interest}</span>
                    <span className={`text-[11px] mt-1 ${isSelected ? 'text-[#D5BDAF]' : 'text-cu-text-muted'}`}>
                      {isSelected ? 'Selected ✓' : 'Click to add'}
                    </span>
                  </div>
                )
              })}
            </div>
            {errors.interests && <p className="text-xs text-red-600 mt-1">{errors.interests}</p>}
          </div>
        )}

        {/* STEP 5: BIO & COLLABORATION */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-bold text-cu-text-main tracking-tight">Bio & Collaboration Style</h2>
              <p className="text-sm text-cu-text-muted mt-1">
                Introduce yourself in a few sentences and specify what types of teams you're looking for.
              </p>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold uppercase tracking-wider text-cu-text-muted">
                Short Student Bio
              </label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share your current side projects, what you're learning, or what you want to build..."
                className="w-full bg-[rgba(255,255,255,0.7)] border border-[rgba(227,213,202,0.85)] rounded-xl p-3.5 text-sm text-cu-text-main focus:outline-none focus:border-[#292724] focus:bg-white"
              />
              {errors.bio && <p className="text-xs text-red-600 mt-0.5">{errors.bio}</p>}
            </div>

            {/* Collaboration Preferences */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-cu-text-muted">
                What are you looking to collaborate on?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {COLLABORATION_TYPES.map(collab => {
                  const isSelected = formData.collaborationPreferences.includes(collab)
                  return (
                    <div
                      key={collab}
                      onClick={() => toggleItem('collaborationPreferences', collab)}
                      className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#292724] text-[#F5EBE0] border-[#292724] font-medium shadow-xs'
                          : 'bg-[rgba(255,255,255,0.6)] border-[rgba(255,255,255,0.7)] text-cu-text-main hover:bg-[rgba(245,235,224,0.6)]'
                      }`}
                    >
                      <span className="text-xs">{collab}</span>
                      {isSelected ? <Check className="w-3.5 h-3.5 text-[#D5BDAF]" /> : <Plus className="w-3.5 h-3.5 text-cu-text-subtle" />}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="pt-6 border-t border-[rgba(227,213,202,0.6)] flex items-center justify-between gap-4">
          {currentStep > 1 ? (
            <Button variant="outline" size="md" icon={ArrowLeft} onClick={handleBack}>
              Previous
            </Button>
          ) : (
            <div />
          )}

          <Button
            variant="primary"
            size="md"
            icon={currentStep === 5 ? Check : ArrowRight}
            iconPosition="right"
            onClick={handleNext}
          >
            {currentStep === 5 ? 'Finish & View Matches' : 'Continue'}
          </Button>
        </div>

      </Card>

    </div>
  )
}
