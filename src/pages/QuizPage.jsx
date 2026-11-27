import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Compass,
  CheckCircle2,
  Heart,
  Brain,
  Zap,
  Users,
  Briefcase,
  Layers,
  Save,
  Check,
  Info,
  Calendar,
  LayoutDashboard
} from 'lucide-react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { QUIZ_12_QUESTIONS, calculateQuizResults } from '../utils/quizEngine'
import { useStudentData } from '../hooks/useStudentData'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

export function QuizPage() {
  const { user } = useAuth()
  const { currentUser, saveQuizResult } = useStudentData()
  const { addToast } = useToast()
  const navigate = useNavigate()

  // Answers mapping: questionId -> optionId (e.g. { 1: '1A', 2: '2C', ... })
  const [answers, setAnswers] = useState({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [resultProfile, setResultProfile] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Initialize from saved profile if available, unless user initiates a retake
  useEffect(() => {
    if (currentUser?.quizResult?.topInterests && !isCompleted && Object.keys(answers).length === 0) {
      setResultProfile(currentUser.quizResult)
      setIsCompleted(true)
    }
  }, [currentUser])

  const currentQ = QUIZ_12_QUESTIONS[currentQuestionIndex]
  const totalQuestions = QUIZ_12_QUESTIONS.length
  const progressPercentage = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)
  const isSelected = Boolean(answers[currentQ?.id])

  const handleSelectOption = (optionId) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionId
    }))
  }

  const handleNext = async () => {
    if (!answers[currentQ.id]) {
      addToast('Please choose an answer before moving forward.', 'info')
      return
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Final Question: Calculate results across all 15 categories
      const calculated = calculateQuizResults(answers)
      setResultProfile(calculated)
      setIsCompleted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      try {
        await saveQuizResult(calculated)
      } catch (err) {
        console.warn('Auto-save note:', err)
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleRetake = () => {
    setAnswers({})
    setCurrentQuestionIndex(0)
    setIsCompleted(false)
    setResultProfile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    addToast('Starting a fresh calibration quiz.', 'info')
  }

  const handleManualSave = async () => {
    if (!resultProfile) return
    setIsSaving(true)
    try {
      await saveQuizResult(resultProfile)
    } catch (err) {
      // Error toast is surfaced by StudentDataContext
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* =========================================================================
          ACTIVE QUIZ QUESTION VIEW (12 Questions)
          ========================================================================= */}
      {!isCompleted ? (
        <div className="space-y-6">
          
          {/* Header Title & Supporting Text (Exact prompt wording) */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-white/70 border border-white/80 text-cu-text-main">
              Intentional Campus Calibration
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#292724] tracking-tight">
              Let's Discover What Makes You, YOU.
            </h1>
            <p className="text-xs sm:text-sm text-cu-text-muted leading-relaxed">
              Answer a few questions and ConnectU will discover your interests, hobbies and the people you might connect with.
            </p>
          </div>

          {/* Progress Indicator Card */}
          <div className="glass-surface p-4 sm:p-5 rounded-[22px] border border-white/75 shadow-glass space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-cu-text-muted uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#292724]" />
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span className="text-cu-text-main font-extrabold">{progressPercentage}% Calibrated</span>
            </div>
            <div className="w-full h-2.5 bg-[rgba(214,204,194,0.4)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#292724] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Question Surface Container */}
          <div className="glass-surface-elevated p-6 sm:p-10 rounded-[28px] shadow-glass-lg border border-white/90 space-y-8 animate-in fade-in duration-200">
            
            {/* Question Heading */}
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cu-text-subtle">
                <span>Domain Exploration</span>
                <span>•</span>
                <span>Single Selection</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#292724] tracking-tight leading-snug">
                {currentQ.question}
              </h2>
            </div>

            {/* 4 Selectable Answer Option Cards (A, B, C, D) */}
            <div className="space-y-3.5">
              {currentQ.options.map((option) => {
                const active = answers[currentQ.id] === option.id
                return (
                  <div
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition-all text-left flex items-start gap-4 ${
                      active
                        ? 'bg-[#292724] text-[#F5EBE0] border-[#292724] shadow-md scale-[1.01]'
                        : 'bg-white/60 backdrop-blur-sm border-white/80 hover:bg-white/90 text-cu-text-main shadow-2xs hover:border-white'
                    }`}
                  >
                    {/* Option Key Capsule (A, B, C, D) */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs flex-shrink-0 transition-colors shadow-xs ${
                        active
                          ? 'bg-[#D5BDAF] text-[#292724]'
                          : 'bg-white/80 text-cu-text-muted border border-[rgba(227,213,202,0.8)]'
                      }`}
                    >
                      {option.key}
                    </div>

                    {/* Option Text */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className={`text-sm sm:text-base font-semibold leading-relaxed ${
                        active ? 'text-[#F5EBE0]' : 'text-cu-text-main'
                      }`}>
                        {option.text}
                      </p>
                    </div>

                    {/* Radio Checkmark Indicator */}
                    <div className="flex-shrink-0 pt-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          active
                            ? 'border-[#D5BDAF] bg-[#D5BDAF]'
                            : 'border-[rgba(227,213,202,0.8)] bg-white/50'
                        }`}
                      >
                        {active && <Check className="w-3 h-3 text-[#292724] stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Previous and Next / Submit Navigation */}
            <div className="pt-6 border-t border-[rgba(227,213,202,0.6)] flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="md"
                icon={ArrowLeft}
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="disabled:opacity-40"
              >
                Previous
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  icon={currentQuestionIndex === totalQuestions - 1 ? Sparkles : ArrowRight}
                  iconPosition="right"
                  onClick={handleNext}
                  disabled={!isSelected}
                  className="shadow-sm"
                >
                  {currentQuestionIndex === totalQuestions - 1 ? 'Submit & Discover' : 'Next Question'}
                </Button>
              </div>
            </div>

          </div>

          {/* Privacy & Methodology Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-white/50 border border-white/70 text-center text-xs text-cu-text-subtle flex items-center justify-center gap-2">
            <Info className="w-3.5 h-3.5 text-cu-text-subtle flex-shrink-0" />
            <span>
              ConnectU uses weighted scoring based on answers to recommend high-synergy student peers. Not a clinical diagnosis.
            </span>
          </div>

        </div>
      ) : (

        /* =========================================================================
            PERSONALIZED INTEREST PROFILE RESULT VIEW (Section 4)
            ========================================================================= */
        <div className="space-y-8 animate-in zoom-in-95 duration-200">
          
          {/* Result Header Lockup */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[rgba(213,189,175,0.4)] border border-cu-accent text-cu-text-main text-xs font-bold shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-cu-success" />
              <span>Calibration Complete • 12 Questions Analyzed</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#292724] tracking-tight">
              Your ConnectU Interest Profile
            </h1>
            <p className="text-xs sm:text-sm text-cu-text-muted leading-relaxed">
              Based on your answers, here is your multidimensional interest profile, hobbies, and working style preferences.
            </p>
          </div>

          {/* Main Working Style & Archetype Hero Card (Section 4C) */}
          <div className="glass-surface-elevated p-7 sm:p-9 rounded-[28px] border border-white/90 shadow-glass-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(227,213,202,0.6)]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#292724] text-[#F5EBE0] flex items-center justify-center shadow-md">
                  <Brain className="w-6 h-6 text-[#D5BDAF]" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-cu-text-subtle">
                    Section C: Your Working Style
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-cu-text-main">
                    {resultProfile?.workingStyle || 'Technical Builder'}
                  </h2>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl bg-white/70 border border-white text-xs font-bold text-cu-text-main shadow-2xs self-start sm:self-auto">
                Descriptive Collaboration Role
              </span>
            </div>

            <p className="text-sm sm:text-base font-medium text-cu-text-main leading-relaxed">
              {resultProfile?.workingStyleData?.tagline || 'Translates ambitious ideas into scalable code and functional products.'}
            </p>

            <p className="text-xs sm:text-sm text-cu-text-muted leading-relaxed">
              {resultProfile?.workingStyleData?.summary || 'You enjoy rolling up your sleeves, diagnosing architecture bottlenecks, and creating tangible working solutions.'}
            </p>

            {/* Best Collaborator Synergies */}
            <div className="p-4 rounded-2xl bg-white/70 border border-white/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cu-text-main uppercase tracking-wider">
                <Zap className="w-4 h-4 text-cu-accent" />
                <span>Highest Synergy Collaborators:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(resultProfile?.workingStyleData?.bestPartners || ['Creative Thinker', 'Strategic Organizer']).map(partner => (
                  <span
                    key={partner}
                    className="text-xs font-bold px-3 py-1 rounded-xl bg-[#292724] text-[#F5EBE0] shadow-xs"
                  >
                    + {partner}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section A: Your Top Interests (5 Strongest Categories) */}
          <div className="glass-surface p-7 sm:p-8 rounded-[24px] border border-white/80 shadow-glass space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cu-text-subtle">
                  Section A
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-cu-text-main">
                  Your Top Interests
                </h3>
              </div>
              <span className="text-xs text-cu-text-muted font-medium">5 Strongest Domains</span>
            </div>

            <div className="space-y-4">
              {(resultProfile?.topInterestsDetailed || []).map((item, idx) => (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-cu-text-main">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-[rgba(213,189,175,0.4)] text-[10px] font-extrabold flex items-center justify-center text-cu-text-main">
                        {idx + 1}
                      </span>
                      {item.category}
                    </span>
                    <span className="text-cu-text-muted font-extrabold">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[rgba(214,204,194,0.35)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#292724] rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Secondary Interests list if available */}
            {resultProfile?.secondaryInterests && resultProfile.secondaryInterests.length > 0 && (
              <div className="pt-3 border-t border-[rgba(227,213,202,0.6)] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cu-text-subtle">
                  Secondary Interest Domains:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {resultProfile.secondaryInterests.map(sec => (
                    <span
                      key={sec}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/70 text-cu-text-main border border-white/80"
                    >
                      {sec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section B & D: Hobbies & Collaboration Preferences (Two Column) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Section B: Your Hobbies */}
            <div className="glass-surface p-6 sm:p-7 rounded-[24px] border border-white/80 shadow-glass flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cu-text-subtle">
                  Section B
                </span>
                <h3 className="text-lg font-extrabold text-cu-text-main mt-0.5 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#A86832]" />
                  Your Hobbies
                </h3>
                <p className="text-xs text-cu-text-muted mt-1">
                  Activities and creative pursuits indicated by your responses.
                </p>

                <div className="space-y-2 mt-4">
                  {(resultProfile?.hobbies || ['Software Tinkering', 'PC & Console Gaming', 'Data Visualization']).map((hobby, idx) => (
                    <div
                      key={hobby}
                      className="p-3 rounded-xl bg-white/70 border border-white/85 text-xs font-bold text-cu-text-main flex items-center gap-2.5 shadow-2xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-cu-accent" />
                      <span>{hobby}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-cu-text-subtle pt-2 border-t border-[rgba(227,213,202,0.6)]">
                Used to match study group buddies and casual weekend project partners.
              </p>
            </div>

            {/* Section D: Your Collaboration Preferences */}
            <div className="glass-surface p-6 sm:p-7 rounded-[24px] border border-white/80 shadow-glass flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cu-text-subtle">
                  Section D
                </span>
                <h3 className="text-lg font-extrabold text-cu-text-main mt-0.5 flex items-center gap-2">
                  <Users className="w-5 h-5 text-cu-dark" />
                  Collaboration Preferences
                </h3>
                <p className="text-xs text-cu-text-muted mt-1">
                  How you connect best with peers on campus projects.
                </p>

                <div className="space-y-2 mt-4">
                  {(resultProfile?.collaborationPreferences || [
                    'Thrives with Creative Thinker & Strategic Organizer peers',
                    'Focus: Hackathons and Product MVPs',
                    'High synergy in Technology and AI domains'
                  ]).map((pref, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/70 border border-white/85 text-xs font-semibold text-cu-text-main flex items-center gap-2.5 shadow-2xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cu-success flex-shrink-0" />
                      <span>{pref}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-cu-text-subtle pt-2 border-t border-[rgba(227,213,202,0.6)]">
                Feeds into the dynamic synergy score on every peer's profile card.
              </p>
            </div>

          </div>

          {/* Section E: Suggested Exploration */}
          <div className="glass-surface-subtle p-6 sm:p-8 rounded-[24px] border border-white/80 shadow-glass space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cu-text-subtle">
                Section E
              </span>
              <h3 className="text-lg font-extrabold text-cu-text-main mt-0.5 flex items-center gap-2">
                <Compass className="w-5 h-5 text-cu-accent" />
                Suggested Skills to Explore
              </h3>
              <p className="text-xs text-cu-text-muted mt-1">
                Curated skills and creative tools to expand your toolkit based on your top interest domains.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(resultProfile?.suggestedSkills || ['TypeScript', 'PyTorch', 'Figma', 'FastAPI', 'Data Storytelling']).map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-cu-text-main border border-white shadow-2xs hover:scale-105 transition-transform"
                >
                  + {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Action Row: Save, Retake, and Explore */}
          <div className="p-6 rounded-[24px] glass-surface-elevated border border-white/90 shadow-glass flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left space-y-0.5">
              <h4 className="text-sm font-bold text-cu-text-main">Interest Profile Ready</h4>
              <p className="text-xs text-cu-text-muted">
                Your campus discovery recommendations and compatibility scores have been updated.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                icon={RefreshCw}
                onClick={handleRetake}
                className="flex-1 sm:flex-none"
              >
                Retake Quiz
              </Button>

              <Button
                variant="secondary"
                size="md"
                icon={Save}
                onClick={handleManualSave}
                disabled={isSaving}
                className="flex-1 sm:flex-none"
              >
                {isSaving ? 'Saving...' : 'Save My Interest Profile'}
              </Button>

              <Link to="/discover" className="flex-1 sm:flex-none">
                <Button
                  variant="primary"
                  size="md"
                  icon={Compass}
                  className="w-full sm:w-auto shadow-sm"
                >
                  View Matched Peers
                </Button>
              </Link>
            </div>
          </div>

        </div>
      )}

    </div>
  )
}
