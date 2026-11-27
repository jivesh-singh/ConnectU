import React, { useState, useMemo } from 'react'
import {
  Search,
  SlidersHorizontal,
  X,
  Compass,
  Sparkles,
  Zap,
  GraduationCap,
  MessageSquare,
  UserPlus,
  Check,
  Clock,
  ArrowRight
} from 'lucide-react'
import { StudentCard } from '../components/cards/StudentCard'
import { Avatar } from '../components/common/Avatar'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { useStudentData } from '../hooks/useStudentData'
import { INTEREST_CATEGORIES, POPULAR_SKILLS } from '../utils/constants'

export function DiscoverPage() {
  const {
    students,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    withdrawFriendRequest,
    startChatWithStudent
  } = useStudentData()

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInterest, setSelectedInterest] = useState('All')
  const [selectedSkill, setSelectedSkill] = useState('All')
  const [sortBy, setSortBy] = useState('match') // 'match' | 'name'

  // Filtered & Sorted Student List
  const filteredStudents = useMemo(() => {
    return students
      .filter(stu => {
        const q = searchQuery.toLowerCase().trim()
        const matchesQuery =
          !q ||
          stu.fullName.toLowerCase().includes(q) ||
          stu.branch.toLowerCase().includes(q) ||
          stu.university.toLowerCase().includes(q) ||
          (stu.skills || []).some(s => s.toLowerCase().includes(q)) ||
          (stu.interests || []).some(i => i.toLowerCase().includes(q))

        const matchesInterest =
          selectedInterest === 'All' ||
          (stu.interests || []).some(i => {
            const iLower = i.toLowerCase()
            const selLower = selectedInterest.toLowerCase()
            return iLower === selLower || selLower.includes(iLower) || iLower.includes(selLower)
          })

        const matchesSkill =
          selectedSkill === 'All' ||
          (stu.skills || []).some(s => s.toLowerCase() === selectedSkill.toLowerCase())

        return matchesQuery && matchesInterest && matchesSkill
      })
      .sort((a, b) => {
        if (sortBy === 'match') {
          return (b.compatibilityScore || 0) - (a.compatibilityScore || 0)
        }
        return a.fullName.localeCompare(b.fullName)
      })
  }, [students, searchQuery, selectedInterest, selectedSkill, sortBy])

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedInterest('All')
    setSelectedSkill('All')
    setSortBy('match')
  }

  const hasActiveFilters = searchQuery !== '' || selectedInterest !== 'All' || selectedSkill !== 'All'

  // Spotlight top match when sorted by match and multiple students present
  const topMatch = filteredStudents.length > 0 && sortBy === 'match' ? filteredStudents[0] : null
  const remainingStudents = topMatch ? filteredStudents.slice(1) : filteredStudents

  return (
    <div className="space-y-8 pb-14">
      
      {/* 1. EDITORIAL HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[rgba(227,213,202,0.6)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/70 border border-white/80 text-cu-text-main">
              Campus Directory
            </span>
            <span className="text-xs text-cu-text-subtle font-medium">
              Verified Collegiate Builders
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292724] tracking-tight mt-1 flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-[#292724]" />
            Discover Students
          </h1>
          <p className="text-xs sm:text-sm text-cu-text-muted mt-0.5">
            Connect with peers based on mutual interests, complementary skills, and shared project rhythms.
          </p>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 text-xs font-semibold text-cu-text-muted">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/70 backdrop-blur-md border border-white/80 rounded-xl px-3 py-2 text-xs text-cu-text-main focus:outline-none focus:border-[#292724] font-semibold shadow-xs"
          >
            <option value="match">Highest Compatibility Match</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* 2. REFINED SEARCH & FILTER CONTROLS */}
      <div className="glass-surface p-5 sm:p-6 rounded-[24px] shadow-glass space-y-4 border border-white/80">
        
        {/* Search Input with Clear Button */}
        <div className="relative">
          <Search className="w-4 h-4 text-cu-text-subtle absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by student name, major (e.g. AI & Robotics), skill (PyTorch, React) or interest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/65 backdrop-blur-md border border-[rgba(227,213,202,0.8)] text-cu-text-main text-sm rounded-xl pl-11 pr-10 py-2.5 placeholder:text-cu-text-subtle focus:outline-none focus:border-[#292724] focus:bg-white shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-cu-text-subtle hover:text-cu-text-main"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Interest Categories Horizontal Pill Track */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-cu-text-subtle font-medium">
            <span className="font-bold uppercase tracking-wider text-[10px]">Filter by Domain:</span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-cu-text-main hover:underline font-bold"
              >
                Reset All Filters
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
            {INTEREST_CATEGORIES.map(category => {
              const isActive = selectedInterest === category
              return (
                <button
                  key={category}
                  onClick={() => setSelectedInterest(category)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 border ${
                    isActive
                      ? 'bg-[#292724] text-[#F5EBE0] border-[#292724] shadow-xs'
                      : 'bg-white/60 border-white/70 text-cu-text-main hover:bg-white/90'
                  }`}
                >
                  {category}
                </button>
              )
            })}
          </div>
        </div>

        {/* Popular Skills Filter */}
        <div className="space-y-1.5 pt-1 border-t border-[rgba(227,213,202,0.5)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cu-text-subtle block">
            Filter by Skillset:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {['All', ...POPULAR_SKILLS.slice(0, 10)].map(skill => {
              const isActive = selectedSkill === skill
              return (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                    isActive
                      ? 'bg-cu-accent text-[#292724] border-cu-accent font-bold'
                      : 'bg-white/50 border-white/60 text-cu-text-muted hover:text-cu-text-main hover:bg-white/80'
                  }`}
                >
                  {skill}
                </button>
              )
            })}
          </div>
        </div>

      </div>

      {/* 3. SPOTLIGHT HERO MATCH (Varied Layout Composition) */}
      {topMatch && !searchQuery && selectedInterest === 'All' && selectedSkill === 'All' && (
        <div className="glass-surface-elevated p-6 sm:p-8 rounded-[24px] shadow-glass-md border border-white/90 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
              <Avatar
                src={topMatch.avatar}
                name={topMatch.fullName}
                size="xl"
                isOnline={topMatch.isOnline}
                className="ring-4 ring-white/90 shadow-md flex-shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#292724] text-[#F5EBE0]">
                    Top Synergy Match
                  </span>
                  <span className="text-xs font-bold text-cu-text-muted">
                    {topMatch.academicYear} • {topMatch.university}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-cu-text-main">
                  {topMatch.fullName}
                </h3>
                <p className="text-xs sm:text-sm text-cu-text-muted font-medium">
                  {topMatch.branch}
                </p>
                <p className="text-xs text-cu-text-main max-w-xl line-clamp-2 leading-relaxed pt-1">
                  "{topMatch.bio}"
                </p>
              </div>
            </div>

            {/* Match Percentage & Action */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[rgba(227,213,202,0.6)]">
              <div className="text-left sm:text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(213,189,175,0.4)] border border-cu-accent text-cu-text-main text-sm font-extrabold">
                  <Sparkles className="w-4 h-4 text-[#A86832]" />
                  <span>{topMatch.compatibilityScore}% Synergy</span>
                </div>
                <p className="text-[10px] text-cu-text-subtle font-medium mt-1">
                  Highest compatibility with your preferences
                </p>
              </div>

              {topMatch.status === 'accepted' ? (
                <Button
                  size="md"
                  variant="secondary"
                  icon={MessageSquare}
                  onClick={async () => {
                    await startChatWithStudent(topMatch)
                  }}
                >
                  Send Message
                </Button>
              ) : topMatch.status === 'pending' ? (
                <Button
                  size="md"
                  variant="outline"
                  icon={Clock}
                  onClick={() => withdrawFriendRequest(topMatch.id)}
                  className="border-dashed"
                >
                  Request Pending
                </Button>
              ) : (
                <Button
                  size="md"
                  variant="primary"
                  icon={UserPlus}
                  onClick={() => sendFriendRequest(topMatch.id)}
                  className="shadow-sm"
                >
                  Connect with {topMatch.fullName.split(' ')[0]}
                </Button>
              )}
            </div>

          </div>

          {/* Complementary Skills Highlight Banner inside Spotlight */}
          {topMatch.compatibilityReasons && topMatch.compatibilityReasons.length > 0 && (
            <div className="mt-5 p-3.5 rounded-xl bg-white/70 border border-white/80 flex items-center gap-2.5 text-xs text-cu-text-main font-medium">
              <Zap className="w-4 h-4 text-cu-accent flex-shrink-0" />
              <span>{topMatch.compatibilityReasons[0]}</span>
            </div>
          )}
        </div>
      )}

      {/* 4. RESULTS SECTION & GRID LAYOUT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-cu-text-subtle">
          <span className="font-semibold">
            Showing {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}
          </span>
          {hasActiveFilters && (
            <span className="text-cu-text-muted">
              Filters active: {selectedInterest !== 'All' ? selectedInterest : ''} {selectedSkill !== 'All' ? `• ${selectedSkill}` : ''}
            </span>
          )}
        </div>

        {filteredStudents.length === 0 ? (
          <EmptyState
            title="No students match your criteria"
            description="Try adjusting your search terms, selecting a broader interest domain, or resetting your filters."
            actionLabel="Reset All Filters"
            onAction={clearAllFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remainingStudents.map(student => (
              <StudentCard
                key={student.id}
                student={student}
              />
            ))}
          </div>
        )}
      </div>

      {/* Evaluation Notice Footer */}
      <div className="pt-6 border-t border-[rgba(227,213,202,0.6)] text-center text-xs text-cu-text-subtle">
        <p>Interactive Evaluation Mode: Profiles represent simulated collegiate student peers for local evaluation.</p>
      </div>

    </div>
  )
}
