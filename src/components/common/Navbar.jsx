import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sparkles, Menu, X, ArrowRight, LayoutDashboard, LogIn } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from './Button'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()
  const location = useLocation()

  return (
    <header className="sticky top-0 z-40 w-full bg-[rgba(237,237,233,0.75)] backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.6)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Wordmark (Section 7) */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#292724] flex items-center justify-center text-[#F5EBE0] shadow-xs group-hover:scale-105 transition-transform font-bold">
              <span className="tracking-tighter text-sm">CU</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#292724]">
                ConnectU
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[rgba(213,189,175,0.35)] text-[#292724] border border-[rgba(255,255,255,0.6)] backdrop-blur-xs">
                Campus
              </span>
            </div>
          </Link>

          {/* Minimal Navigation (Section 7) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-cu-text-muted">
            <a href="/#how-it-works" className="hover:text-cu-text-main transition-colors">
              How it works
            </a>
            <Link
              to="/discover"
              className={`hover:text-cu-text-main transition-colors ${
                location.pathname === '/discover' ? 'text-cu-text-main font-semibold' : ''
              }`}
            >
              Discover
            </Link>
            <Link
              to="/quiz"
              className={`flex items-center gap-1.5 hover:text-cu-text-main transition-colors ${
                location.pathname === '/quiz' ? 'text-cu-text-main font-semibold' : ''
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cu-accent" />
              Quiz
            </Link>
          </nav>

          {/* Right Action: Sign In & Primary CTA (Section 7) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <Button variant="primary" size="sm" icon={LayoutDashboard}>
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm" icon={LogIn}>
                    Sign in
                  </Button>
                </Link>
                <Link to="/onboarding">
                  <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-cu-text-main hover:bg-[rgba(214,204,194,0.3)] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Glass Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[rgba(255,255,255,0.6)] bg-[rgba(245,235,224,0.92)] backdrop-blur-xl px-4 pt-3 pb-6 animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-2 font-medium text-sm text-cu-text-main">
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-[rgba(255,255,255,0.5)] transition-colors"
            >
              How it works
            </a>
            <Link
              to="/discover"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-[rgba(255,255,255,0.5)] transition-colors"
            >
              Discover
            </Link>
            <Link
              to="/quiz"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-[rgba(255,255,255,0.5)] transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cu-accent" />
              Interest Quiz
            </Link>
            <hr className="border-[rgba(227,213,202,0.8)] my-2" />
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth icon={LayoutDashboard}>
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" fullWidth onClick={() => { logout(); setMobileMenuOpen(false); }}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" fullWidth>
                    Sign in
                  </Button>
                </Link>
                <Link to="/onboarding" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth>
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
