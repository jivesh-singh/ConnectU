import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PublicLayout } from './layouts/PublicLayout'
import { AppLayout } from './layouts/AppLayout'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { DashboardPage } from './pages/DashboardPage'
import { DiscoverPage } from './pages/DiscoverPage'
import { QuizPage } from './pages/QuizPage'
import { NetworkPage } from './pages/NetworkPage'
import { MessagesPage } from './pages/MessagesPage'
import { ProfileSettingsPage } from './pages/ProfileSettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'

export function App() {
  return (
    <Routes>
      {/* Public Pages with Landing Navbar & Editorial Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
      </Route>

      {/* Focused Multi-step Registration Flow */}
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Main Student Application Suite */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/network" element={<NetworkPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/profile" element={<ProfileSettingsPage />} />
        <Route path="/settings" element={<ProfileSettingsPage />} />
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
