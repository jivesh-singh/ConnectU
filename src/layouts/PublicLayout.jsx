import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Navbar } from '../components/common/Navbar'
import { Sparkles } from 'lucide-react'

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-cu-bg text-cu-text-main selection:bg-cu-accent selection:text-cu-text-main relative">
      
      {/* Subtle ambient blurred beige shapes behind landing layout for glass depth */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-1/4 w-[45rem] h-[45rem] rounded-full bg-[rgba(214,204,194,0.35)] blur-[90px]" />
        <div className="absolute top-1/2 -left-20 w-[40rem] h-[40rem] rounded-full bg-[rgba(245,235,224,0.7)] blur-[80px]" />
        <div className="absolute bottom-10 right-10 w-[42rem] h-[42rem] rounded-full bg-[rgba(213,189,175,0.3)] blur-[85px]" />
      </div>

      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Editorial Premium Glass Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.6)] bg-[rgba(245,235,224,0.72)] backdrop-blur-xl py-14 px-4 sm:px-6 lg:px-8 mt-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#292724] flex items-center justify-center text-[#F5EBE0] font-bold text-sm shadow-xs">
                CU
              </div>
              <span className="text-lg font-bold text-cu-text-main">ConnectU</span>
            </div>
            <p className="text-sm text-cu-text-muted max-w-sm leading-relaxed">
              An intentional campus networking ecosystem. Connecting college students based on true intellectual curiosity, project ambition, complementary skills, and creative synergy.
            </p>
            <div className="flex items-center gap-2 text-xs text-cu-text-subtle">
              <span>Crafted for collegiate innovators, founders & researchers</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cu-text-main mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-cu-text-muted">
              <li>
                <Link to="/discover" className="hover:text-cu-text-main transition-colors">
                  Discover Students
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="hover:text-cu-text-main transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cu-accent" />
                  Interest Quiz
                </Link>
              </li>
              <li>
                <Link to="/onboarding" className="hover:text-cu-text-main transition-colors">
                  Join Campus Network
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-cu-text-main transition-colors">
                  Student Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cu-text-main mb-3">
              Technology & Privacy
            </h4>
            <ul className="space-y-2 text-sm text-cu-text-muted">
              <li>
                <span className="text-cu-text-muted">Supabase Architecture</span>
              </li>
              <li>
                <span className="text-cu-text-muted">WebRTC P2P Voice Rooms</span>
              </li>
              <li>
                <span className="text-cu-text-muted">Student Privacy First</span>
              </li>
              <li>
                <span className="text-cu-text-muted">Campus Verified (.edu)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-[rgba(227,213,202,0.6)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cu-text-subtle">
          <p>© {new Date().getFullYear()} ConnectU. Modern glassmorphism & editorial campus network.</p>
          <div className="flex items-center gap-6">
            <span>Security</span>
            <span>Academic Integrity</span>
            <span>Terms of Collaboration</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
