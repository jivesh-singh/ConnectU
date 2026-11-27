import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  Users,
  MessageSquare,
  Compass,
  GraduationCap,
  Calendar,
  Layers,
  Zap,
  CheckCircle2,
  Cpu,
  Palette,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Brain,
  Code2,
  Heart,
  Share2,
  Terminal,
  ShieldCheck
} from 'lucide-react'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Card } from '../components/common/Card'
import { Avatar } from '../components/common/Avatar'
import { DEMO_PREVIEW_STUDENTS, DEMO_COLLABORATIONS } from '../services/mockData'

export function LandingPage() {
  const [activeDomainFilter, setActiveDomainFilter] = useState('All')

  const previewStudents = activeDomainFilter === 'All'
    ? DEMO_PREVIEW_STUDENTS
    : DEMO_PREVIEW_STUDENTS.filter(s =>
        (s.interests || []).includes(activeDomainFilter) ||
        (s.skills || []).some(k => k.toLowerCase().includes(activeDomainFilter.toLowerCase()))
      )

  const featuredStudent = previewStudents[0] || DEMO_PREVIEW_STUDENTS[0]
  const secondaryStudents = previewStudents.slice(1, 3)

  return (
    <div className="space-y-24 sm:space-y-36 pb-24 overflow-hidden">
      
      {/* =========================================================================
          1. HERO SECTION (High Priority Redesign)
          - Left: Large editorial headline, supporting message, improved CTAs
          - Right: Dynamic connection visualization between 2 students with a
                   central visual relationship, shared interests, complementary skills,
                   and layered asymmetric floating depth
          ========================================================================= */}
      <section className="relative pt-6 sm:pt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center min-h-[560px]">
          
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-6 space-y-7 text-left z-10">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-pill shadow-xs">
              <span className="w-2 h-2 rounded-full bg-cu-accent animate-pulse" />
              <span className="text-xs font-semibold text-cu-text-main tracking-tight">
                An Intentional Student Collaboration Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold tracking-tight text-[#292724] leading-[1.08]">
              Find Your People.{' '}
              <span className="inline-block relative">
                Build Something
                <span className="absolute bottom-1 left-0 w-full h-3.5 bg-[#D5BDAF]/40 -z-10 rounded-sm" />
              </span>{' '}
              Together.
            </h1>

            <p className="text-base sm:text-lg text-cu-text-muted max-w-xl leading-relaxed">
              Meet students who share your interests, complement your skills and help turn your ideas into something meaningful.
            </p>

            {/* CTA Buttons with Improved Styling & Hover States */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link to="/onboarding">
                <Button
                  size="lg"
                  variant="primary"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="w-full sm:w-auto shadow-md hover:shadow-lg hover:bg-black transition-all active:scale-[0.98]"
                >
                  Find Your People
                </Button>
              </Link>
              <Link to="/discover">
                <Button
                  size="lg"
                  variant="glass"
                  icon={Compass}
                  className="w-full sm:w-auto border-[rgba(255,255,255,0.7)] hover:border-white hover:bg-[rgba(245,235,224,0.85)] shadow-xs transition-all active:scale-[0.98]"
                >
                  Discover ConnectU
                </Button>
              </Link>
            </div>

            {/* Editorial Social Proof Bar */}
            <div className="pt-6 border-t border-[rgba(227,213,202,0.7)] flex flex-wrap items-center gap-6 text-xs text-cu-text-muted">
              <div className="flex -space-x-2.5">
                <Avatar src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" size="sm" className="ring-2 ring-white/80" />
                <Avatar src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80" size="sm" className="ring-2 ring-white/80" />
                <Avatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" size="sm" className="ring-2 ring-white/80" />
                <Avatar src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80" size="sm" className="ring-2 ring-white/80" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-cu-text-main flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cu-warning" />
                  Calibrated for Collegiate Builders
                </p>
                <p className="text-cu-text-subtle">
                  Engineers, UI/UX designers, researchers & student founders
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Connection Visualization with Central Relationship */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[500px]">
            
            {/* Ambient Backlight Glow behind relationship */}
            <div className="absolute w-80 h-80 rounded-full bg-[rgba(213,189,175,0.45)] blur-[70px] pointer-events-none -z-10" />

            {/* Layered Card 3 (Asymmetric Background Floating Peer: Marcus Vance - HCI) */}
            <div className="absolute -top-6 -right-2 sm:right-0 w-64 glass-surface-subtle p-3.5 shadow-glass animate-float-slow hidden sm:block z-0 opacity-90 border border-white/60">
              <div className="flex items-center gap-2.5">
                <Avatar
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&q=80"
                  name="Marcus Vance"
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-cu-text-main truncate">Marcus Vance</p>
                  <p className="text-[10px] text-cu-text-muted truncate">Product Design • Stanford</p>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[rgba(213,189,175,0.4)] text-cu-text-main border border-cu-accent">
                  92% Match
                </span>
              </div>
              <div className="mt-2 flex gap-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 text-cu-text-main font-medium">Design Systems</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 text-cu-text-main font-medium">Figma</span>
              </div>
            </div>

            {/* Central Visual Relationship Container */}
            <div className="relative w-full max-w-md glass-surface-elevated p-6 sm:p-7 shadow-glass-lg z-10 space-y-5 animate-float-medium border border-white/80">
              
              {/* Header Status Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(227,213,202,0.6)]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cu-success animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cu-text-muted">
                    Dynamic Connection Match
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#292724] text-[#F5EBE0] text-xs font-bold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#D5BDAF]" />
                  <span>96% Synergy</span>
                </div>
              </div>

              {/* Student A <-> Student B Visual Connection Nodes */}
              <div className="relative flex items-center justify-between gap-4 py-2">
                
                {/* Student A (You / Jordan) */}
                <div className="flex flex-col items-center text-center space-y-1.5 z-10 w-28">
                  <div className="relative">
                    <Avatar
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=220&q=80"
                      name="Jordan Lee"
                      size="xl"
                      className="ring-4 ring-white/90 shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#292724] text-[#F5EBE0] text-[9px] font-bold">
                      YOU
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-cu-text-main">Jordan Lee</h4>
                    <p className="text-[10px] text-cu-text-muted">CS & Frontend</p>
                    <p className="text-[9px] text-cu-text-subtle font-medium">Junior • Stanford</p>
                  </div>
                </div>

                {/* Central Synergy Bridge & Glowing Pulse Node */}
                <div className="flex-1 flex flex-col items-center justify-center relative">
                  {/* Connecting Line with pulse */}
                  <div className="w-full flex items-center justify-center relative my-1">
                    <div className="h-0.5 w-full bg-gradient-to-r from-[#D5BDAF] via-[#292724] to-[#D5BDAF] opacity-70" />
                    <div className="absolute w-8 h-8 rounded-full bg-[#292724] text-[#F5EBE0] flex items-center justify-center shadow-md border-2 border-white">
                      <Zap className="w-4 h-4 text-[#D5BDAF]" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-cu-text-main uppercase tracking-wider mt-2">
                    Complementary
                  </span>
                  <span className="text-[9px] text-cu-text-subtle text-center">
                    Zero role collision
                  </span>
                </div>

                {/* Student B (Elena) */}
                <div className="flex flex-col items-center text-center space-y-1.5 z-10 w-28">
                  <div className="relative">
                    <Avatar
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=220&q=80"
                      name="Elena Rostova"
                      size="xl"
                      isOnline={true}
                      className="ring-4 ring-white/90 shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-cu-accent text-[#292724] text-[9px] font-bold border border-white">
                      PEER
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-cu-text-main">Elena Rostova</h4>
                    <p className="text-[10px] text-cu-text-muted">AI & Robotics</p>
                    <p className="text-[9px] text-cu-text-subtle font-medium">Junior • Stanford</p>
                  </div>
                </div>

              </div>

              {/* Shared Interests & Complementary Skills Breakdown */}
              <div className="space-y-2.5 pt-1">
                <div className="p-3 rounded-xl bg-[rgba(245,235,224,0.6)] border border-white/70 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-cu-text-main">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-cu-dark" />
                      Complementary Skill Synergy
                    </span>
                    <span className="text-cu-success font-semibold">High Leverage</span>
                  </div>
                  <p className="text-[11px] text-cu-text-muted leading-tight">
                    <strong className="text-cu-text-main">React & UI Architecture</strong> pairs seamlessly with <strong className="text-cu-text-main">PyTorch Vision Pipelines</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.65)] border border-white/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-cu-text-main">
                    <Heart className="w-3.5 h-3.5 text-[#A86832]" />
                    Shared Curiosity & Preferences
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EDEDE9] text-cu-text-main">
                      Generative AI
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EDEDE9] text-cu-text-main">
                      Hackathons 2026
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EDEDE9] text-cu-text-main">
                      Async Collaboration
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button inside Hero Visual */}
              <Link to="/discover" className="block pt-1">
                <Button
                  variant="primary"
                  fullWidth
                  size="sm"
                  icon={MessageSquare}
                  className="shadow-sm hover:shadow-md"
                >
                  Connect & Build Project
                </Button>
              </Link>
            </div>

            {/* Layered Card 2 (Bottom-Left Background Floating Student: Aarav - Data Science) */}
            <div className="absolute -bottom-7 -left-3 sm:left-2 w-64 glass-surface-subtle p-3.5 shadow-glass animate-float-subtle hidden sm:block z-0 opacity-90 border border-white/60">
              <div className="flex items-center gap-2.5">
                <Avatar
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80"
                  name="Aarav Patel"
                  size="sm"
                  isOnline={true}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-cu-text-main truncate">Aarav Patel</p>
                  <p className="text-[10px] text-cu-text-muted truncate">Data Science • UC Berkeley</p>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[rgba(213,189,175,0.4)] text-cu-text-main border border-cu-accent">
                  94% Match
                </span>
              </div>
              <div className="mt-2 flex gap-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 text-cu-text-main font-medium">SQL</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 text-cu-text-main font-medium">Data Pipelines</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          2. HOW CONNECTU WORKS (Alternating Step Journey with Distinct Visual Rhythms)
          ========================================================================= */}
      <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="glass-surface p-8 sm:p-14 shadow-glass space-y-12 border border-white/70">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cu-text-subtle">
              The Architecture of Connection
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#292724] tracking-tight">
              How ConnectU Works
            </h2>
            <p className="text-sm text-cu-text-muted leading-relaxed">
              Designed to replace cold LinkedIn outreach with intentional, interest-first discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1: Calibration */}
            <div className="glass-surface-subtle p-7 space-y-4 text-left border border-white/80 rounded-2xl flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-[#292724] text-[#F5EBE0] font-extrabold text-sm flex items-center justify-center shadow-xs">
                  01
                </div>
                <h3 className="text-lg font-bold text-cu-text-main leading-snug">
                  Take the 2-Minute Archetype Calibration
                </h3>
                <p className="text-xs sm:text-sm text-cu-text-muted leading-relaxed">
                  Assess your cognitive working style, primary technical toolset, and project pacing to determine your authentic collaboration profile.
                </p>
              </div>
              <div className="pt-3 border-t border-[rgba(227,213,202,0.6)] flex flex-wrap gap-1.5">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 text-cu-text-main">
                  Working Rhythm
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 text-cu-text-main">
                  Tech Stack
                </span>
              </div>
            </div>

            {/* Step 2: Compatibility */}
            <div className="glass-surface-elevated p-7 space-y-4 text-left border border-white/90 rounded-2xl flex flex-col justify-between shadow-glass-md hover:translate-y-[-2px] transition-transform">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-cu-accent text-[#292724] font-extrabold text-sm flex items-center justify-center border border-white/70 shadow-xs">
                  02
                </div>
                <h3 className="text-lg font-bold text-cu-text-main leading-snug">
                  Explore Curated Peer Synergies
                </h3>
                <p className="text-xs sm:text-sm text-cu-text-muted leading-relaxed">
                  Review student profiles ranked by synergy percentage. Every match surfaces transparent reasons highlighting where your abilities cross-pollinate.
                </p>
              </div>
              <div className="pt-3 border-t border-[rgba(227,213,202,0.6)] flex flex-wrap gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#292724] text-[#F5EBE0]">
                  Dynamic Match %
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 text-cu-text-main">
                  Shared Goals
                </span>
              </div>
            </div>

            {/* Step 3: Collaboration */}
            <div className="glass-surface-subtle p-7 space-y-4 text-left border border-white/80 rounded-2xl flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-[rgba(214,204,194,0.7)] text-[#292724] font-extrabold text-sm flex items-center justify-center border border-white/70 shadow-xs">
                  03
                </div>
                <h3 className="text-lg font-bold text-cu-text-main leading-snug">
                  Direct Messaging & In-App Voice
                </h3>
                <p className="text-xs sm:text-sm text-cu-text-muted leading-relaxed">
                  Send connection requests, jump straight into private real-time chat, or spin up an in-app voice room to plan hackathon sprints and side projects.
                </p>
              </div>
              <div className="pt-3 border-t border-[rgba(227,213,202,0.6)] flex flex-wrap gap-1.5">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 text-cu-text-main">
                  Realtime Chat
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 text-cu-text-main">
                  WebRTC Audio
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          3. DISCOVER STUDENTS SHOWCASE (Asymmetrical Spotlight Layout)
          - Left: 1 Featured "Student of the Week" Hero Card with deep breakdown
          - Right: 2 Stacked Peer Profile Cards with quick connect triggers
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cu-text-subtle">
              Campus Spotlight
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#292724] tracking-tight mt-1">
              Discover Passionate Students
            </h2>
            <p className="text-sm text-cu-text-muted mt-1 max-w-xl">
              Filter by engineering disciplines, design crafts, or research topics to find the exact peer your project needs.
            </p>
          </div>

          {/* Domain Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'AI and ML', 'Design', 'Technology', 'Entrepreneurship'].map(domain => (
              <button
                key={domain}
                onClick={() => setActiveDomainFilter(domain)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  activeDomainFilter === domain
                    ? 'bg-[#292724] text-[#F5EBE0] border-[#292724] shadow-xs'
                    : 'bg-white/60 border-white/70 text-cu-text-main hover:bg-white/90'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Asymmetrical Spotlight Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Featured Spotlight Card (Takes 7 cols) */}
          <div className="lg:col-span-7 glass-surface-elevated p-7 rounded-[22px] border border-white/85 shadow-glass-md flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar
                    src={featuredStudent.avatar}
                    name={featuredStudent.fullName}
                    size="xl"
                    isOnline={featuredStudent.isOnline}
                    className="ring-2 ring-white/90 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-cu-text-main">
                        {featuredStudent.fullName}
                      </h3>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#292724] text-[#F5EBE0]">
                        Featured
                      </span>
                    </div>
                    <p className="text-xs text-cu-text-muted font-medium mt-0.5">
                      {featuredStudent.branch} • {featuredStudent.academicYear}
                    </p>
                    <p className="text-[11px] text-cu-text-subtle">
                      {featuredStudent.university}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[rgba(213,189,175,0.4)] text-cu-text-main font-bold text-xs border border-cu-accent">
                    <Sparkles className="w-3.5 h-3.5 text-[#A86832]" />
                    {featuredStudent.compatibilityScore}% Synergy
                  </span>
                  <span className="text-[10px] text-cu-text-subtle mt-0.5">Match Accuracy</span>
                </div>
              </div>

              <div className="mt-5 p-4 rounded-xl bg-[rgba(245,235,224,0.55)] border border-white/70">
                <p className="text-xs sm:text-sm text-cu-text-main leading-relaxed">
                  "{featuredStudent.bio}"
                </p>
              </div>

              {/* Skills and Synergies */}
              <div className="mt-5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cu-text-subtle">
                  Core Technical & Creative Tooling
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(featuredStudent.skills || []).map(skill => (
                    <Badge key={skill} variant="glass" size="sm">
                      {skill}
                    </Badge>
                  ))}
                  {(featuredStudent.interests || []).map(interest => (
                    <Badge key={interest} variant="default" size="sm">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[rgba(227,213,202,0.6)] flex items-center justify-between">
              <span className="text-xs text-cu-text-subtle font-medium">
                Open to Hackathons & Joint Projects
              </span>
              <Link to="/discover">
                <Button size="sm" variant="primary" icon={ArrowRight} iconPosition="right">
                  View Full Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Secondary Stack (Takes 5 cols: 2 Cards) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {secondaryStudents.map(student => (
              <div
                key={student.id}
                className="glass-surface p-6 rounded-[20px] border border-white/70 shadow-glass flex-1 flex flex-col justify-between space-y-4 hover:border-white transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={student.avatar} name={student.fullName} size="md" isOnline={student.isOnline} />
                      <div>
                        <h4 className="text-sm font-bold text-cu-text-main">{student.fullName}</h4>
                        <p className="text-[11px] text-cu-text-muted">{student.branch}</p>
                        <p className="text-[10px] text-cu-text-subtle">{student.university}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-[rgba(213,189,175,0.35)] text-cu-text-main border border-cu-accent">
                      {student.compatibilityScore}%
                    </span>
                  </div>

                  <p className="text-xs text-cu-text-muted line-clamp-2 mt-3 leading-relaxed">
                    {student.bio}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {(student.skills || []).slice(0, 3).map(skill => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 rounded-md bg-white/70 text-cu-text-main font-medium border border-white/80">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[rgba(227,213,202,0.6)] flex items-center justify-between">
                  <span className="text-[10px] text-cu-text-subtle">{student.academicYear}</span>
                  <Link to="/discover">
                    <span className="text-xs font-bold text-cu-text-main hover:underline flex items-center gap-1">
                      Connect <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. PERSONALITY & INTEREST MATCHING (Alternating Text-and-Visual Composition)
          - Left: Editorial breakdown of matching philosophy
          - Right: Interactive Trait Breakdown Card
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-cu-text-subtle">
              Deep Personality Calibration
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#292724] tracking-tight leading-tight">
              Chemistry Beyond Resume Keywords
            </h2>
            <p className="text-sm sm:text-base text-cu-text-muted leading-relaxed">
              Great teams aren't formed by listing languages on a bulletin board. ConnectU analyzes how you like to work, whether you solve problems intuitively or systematically, and what communication rhythm brings out your best output.
            </p>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl glass-surface-subtle border border-white/70">
                <Brain className="w-5 h-5 text-cu-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-cu-text-main">Cognitive Working Styles</h4>
                  <p className="text-xs text-cu-text-muted mt-0.5">Balancing architectural rigor with rapid creative hypothesis testing.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl glass-surface-subtle border border-white/70">
                <MessageSquare className="w-5 h-5 text-cu-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-cu-text-main">Communication Rhythm Alignment</h4>
                  <p className="text-xs text-cu-text-muted mt-0.5">Matching async documenters with async peers, and voice ideators with voice callers.</p>
                </div>
              </div>
            </div>

            <Link to="/quiz">
              <Button variant="primary" icon={Sparkles}>
                Calibrate Your Archetype
              </Button>
            </Link>
          </div>

          {/* Interactive Trait Breakdown Card */}
          <div className="lg:col-span-6">
            <div className="glass-surface-elevated p-7 sm:p-9 space-y-6 shadow-glass-md border border-white/80 rounded-[22px]">
              <div className="flex items-center justify-between pb-3.5 border-b border-[rgba(227,213,202,0.6)]">
                <div>
                  <h4 className="text-base font-bold text-cu-text-main">Archetype Synergy Analysis</h4>
                  <p className="text-xs text-cu-text-muted">The Visionary Builder vs. The AI Systems Architect</p>
                </div>
                <Badge variant="accent" size="sm">96% Alignment</Badge>
              </div>

              {/* Progress bars showing synergy across 3 axes */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-cu-text-main mb-1.5">
                    <span>Problem Solving Complementarity</span>
                    <span>98%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[rgba(214,204,194,0.4)] overflow-hidden">
                    <div className="h-full bg-[#292724] rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-cu-text-main mb-1.5">
                    <span>Curiosity & Passion Domain Overlap</span>
                    <span>92%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[rgba(214,204,194,0.4)] overflow-hidden">
                    <div className="h-full bg-cu-accent rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-cu-text-main mb-1.5">
                    <span>Sprint & Execution Rhythm</span>
                    <span>94%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[rgba(214,204,194,0.4)] overflow-hidden">
                    <div className="h-full bg-[#292724] rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/70 text-xs text-cu-text-muted border border-white/80 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cu-success flex-shrink-0" />
                <span className="font-medium text-cu-text-main">
                  Pairing produces zero team role collisions and high prototype execution velocity.
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          5. FIND COMPLEMENTARY SKILLS (Visual Synergy Bridge between Disciplines)
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="glass-surface p-8 sm:p-12 shadow-glass space-y-10 border border-white/70">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cu-text-subtle">
              Cross-Disciplinary Power
            </span>
            <h2 className="text-3xl font-extrabold text-[#292724] tracking-tight">
              Complementary Skills Synergy
            </h2>
            <p className="text-sm text-cu-text-muted">
              ConnectU connects developers with designers, and machine learning researchers with product storytellers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left: Engineering Stack */}
            <div className="md:col-span-5 glass-surface-subtle p-7 space-y-3.5 border border-white/80 rounded-2xl">
              <div className="flex items-center gap-2.5 text-cu-text-main">
                <Code2 className="w-5 h-5 text-cu-accent" />
                <h4 className="text-sm font-bold">The Engineering Architect</h4>
              </div>
              <p className="text-xs text-cu-text-muted leading-relaxed">
                Excels at distributed state, robust APIs, database schema normalization, and PyTorch inference pipelines.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Badge variant="glass" size="sm">React</Badge>
                <Badge variant="glass" size="sm">FastAPI</Badge>
                <Badge variant="glass" size="sm">PostgreSQL</Badge>
                <Badge variant="glass" size="sm">PyTorch</Badge>
              </div>
            </div>

            {/* Middle: Synergy Bridge Connector */}
            <div className="md:col-span-2 flex flex-col items-center justify-center text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-[#292724] text-[#F5EBE0] flex items-center justify-center shadow-md">
                <Zap className="w-6 h-6 text-[#D5BDAF]" />
              </div>
              <span className="text-xs font-bold text-cu-text-main mt-2">Optimal Blend</span>
              <span className="text-[10px] text-cu-text-subtle">Zero blind spots</span>
            </div>

            {/* Right: Product & Design Craft */}
            <div className="md:col-span-5 glass-surface-subtle p-7 space-y-3.5 border border-white/80 rounded-2xl">
              <div className="flex items-center gap-2.5 text-cu-text-main">
                <Palette className="w-5 h-5 text-cu-accent" />
                <h4 className="text-sm font-bold">The Product & Design Pioneer</h4>
              </div>
              <p className="text-xs text-cu-text-muted leading-relaxed">
                Excels at user journey mapping, design systems, glassmorphism UI craft, pitch decks, and intuitive micro-interactions.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Badge variant="glass" size="sm">Figma</Badge>
                <Badge variant="glass" size="sm">Design Systems</Badge>
                <Badge variant="glass" size="sm">User Research</Badge>
                <Badge variant="glass" size="sm">Storytelling</Badge>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          6. BUILD YOUR NETWORK (Modern Social Networking Interface Showcase)
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-cu-text-subtle">
              Frictionless Friendship
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#292724] tracking-tight leading-tight">
              Build a Real Campus Circle
            </h2>
            <p className="text-sm sm:text-base text-cu-text-muted leading-relaxed">
              No endless connection feeds or superficial influencer clout. ConnectU networks are built for genuine peers who meet up in library study rooms, work in university labs, or pull all-nighters at hackathons.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl glass-surface-subtle border border-white/70">
                <h4 className="text-xl font-extrabold text-cu-text-main">100%</h4>
                <p className="text-xs text-cu-text-muted mt-0.5">Verified collegiate students via .edu auth</p>
              </div>
              <div className="p-4 rounded-2xl glass-surface-subtle border border-white/70">
                <h4 className="text-xl font-extrabold text-cu-text-main">0%</h4>
                <p className="text-xs text-cu-text-muted mt-0.5">Spam recruiters or corporate advertising</p>
              </div>
            </div>

            <Link to="/network">
              <Button variant="secondary" icon={Users}>
                Preview Network Manager
              </Button>
            </Link>
          </div>

          {/* Network Preview Glass Stack */}
          <div className="lg:col-span-6 space-y-3.5">
            <div className="glass-surface-elevated p-5 flex items-center justify-between gap-3 shadow-glass border border-white/80 rounded-2xl">
              <div className="flex items-center gap-3.5">
                <Avatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" size="md" isOnline={true} />
                <div>
                  <h5 className="text-xs font-bold text-cu-text-main">Aarav Patel</h5>
                  <p className="text-[11px] text-cu-text-muted">UC Berkeley • Data Science</p>
                  <p className="text-[10px] text-cu-text-subtle font-medium">Shared interest in Generative AI</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="primary">Accept</Button>
                <Button size="sm" variant="ghost">Decline</Button>
              </div>
            </div>

            <div className="glass-surface-subtle p-5 flex items-center justify-between gap-3 border border-white/70 rounded-2xl">
              <div className="flex items-center gap-3.5">
                <Avatar src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" size="md" />
                <div>
                  <h5 className="text-xs font-bold text-cu-text-main">Sofia Reyes</h5>
                  <p className="text-[11px] text-cu-text-muted">MIT • Mechanical Engineering</p>
                  <p className="text-[10px] text-cu-text-subtle font-medium">Seeking Robotics co-builder</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-cu-text-muted px-3 py-1.5 rounded-lg bg-white/70 border border-white">
                Connected
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          7. ACTIVE PROJECT HUDDLES (Collaboration Opportunities)
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cu-text-subtle">
            Active Initiatives
          </span>
          <h2 className="text-3xl font-extrabold text-[#292724] tracking-tight">
            Connect & Collaborate on Live Projects
          </h2>
          <p className="text-sm text-cu-text-muted">
            Jump into campus hackathon squads, research experiments, and open-source packages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEMO_COLLABORATIONS.map((collab) => (
            <div
              key={collab.id}
              className="glass-surface p-6 rounded-[20px] border border-white/70 shadow-glass flex flex-col justify-between space-y-4 hover:border-white transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="accent" size="sm">
                    {collab.category}
                  </Badge>
                  <span className="text-[10px] text-cu-text-subtle font-medium">
                    {collab.spotsLeft} spots open
                  </span>
                </div>
                <h4 className="text-base font-bold text-cu-text-main leading-snug">
                  {collab.title}
                </h4>
                <p className="text-xs text-cu-text-muted leading-relaxed">
                  {collab.description}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(collab.rolesNeeded || []).map((role) => (
                    <span
                      key={role}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/70 text-cu-text-main font-semibold border border-white/80"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[rgba(227,213,202,0.6)] flex items-center justify-between">
                <span className="text-[11px] text-cu-text-subtle">{collab.owner}</span>
                <Link to="/discover">
                  <span className="text-xs font-bold text-cu-text-main hover:underline flex items-center gap-1">
                    Apply <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          8. FINAL CALL TO ACTION (Glass Centerpiece)
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="glass-surface-elevated p-8 sm:p-14 text-center space-y-6 shadow-glass-lg border border-white/90 rounded-[28px] relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-[#292724] text-[#F5EBE0] mx-auto flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-[#D5BDAF]" />
          </div>
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#292724] tracking-tight">
              Ready to meet your next co-builder?
            </h2>
            <p className="text-sm sm:text-base text-cu-text-muted leading-relaxed">
              Take the 2-minute interest quiz, discover students on your wavelength, and turn your college experience into something unforgettable.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link to="/onboarding">
              <Button size="lg" variant="primary" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto shadow-md">
                Get Started with ConnectU
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
