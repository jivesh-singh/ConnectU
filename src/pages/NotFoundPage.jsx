import React from 'react'
import { Link } from 'react-router-dom'
import { Compass, ArrowLeft } from 'lucide-react'
import { Button } from '../components/common/Button'

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-cu-secondary/70 border border-cu-border flex items-center justify-center text-cu-dark mb-4">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-cu-text-main tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-cu-text-main mb-2">Page Not Found</h2>
      <p className="text-sm text-cu-text-muted max-w-sm mb-6">
        The student resource or campus page you are looking for does not exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" icon={ArrowLeft}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  )
}
