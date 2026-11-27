import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  className = ''
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Frosted Backdrop */}
      <div
        className="fixed inset-0 bg-[#292724]/25 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Glassmorphic Modal Dialog Box */}
      <div
        className={`relative w-full ${maxWidth} bg-[rgba(255,255,255,0.85)] backdrop-blur-[24px] border border-[rgba(255,255,255,0.8)] rounded-3xl shadow-glass-lg p-6 sm:p-7 text-cu-text-main z-10 transition-all animate-in zoom-in-95 fade-in duration-200 ${className}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 mb-5 border-b border-[rgba(227,213,202,0.6)] pb-4">
          <div>
            {title && <h3 className="text-xl font-bold tracking-tight text-[#292724]">{title}</h3>}
            {subtitle && <p className="text-xs text-cu-text-muted mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-cu-text-muted hover:text-cu-text-main hover:bg-[rgba(214,204,194,0.35)] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  )
}
