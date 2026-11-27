import React from 'react'

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  onClick,
  onRemove
}) {
  const variants = {
    // Frosted glass chips with subtle borders
    default: 'bg-[rgba(214,204,194,0.45)] backdrop-blur-sm text-cu-text-main border border-[rgba(255,255,255,0.55)]',
    accent: 'bg-[rgba(213,189,175,0.45)] backdrop-blur-sm text-cu-text-main border border-[rgba(213,189,175,0.8)] font-semibold',
    glass: 'bg-[rgba(255,255,255,0.65)] backdrop-blur-md text-cu-text-main border border-[rgba(255,255,255,0.7)] shadow-xs',
    dark: 'bg-[#292724] text-[#F5EBE0] font-medium',
    success: 'bg-[rgba(78,114,89,0.12)] backdrop-blur-sm text-[#3E5C46] border border-[rgba(78,114,89,0.25)] font-medium',
    warning: 'bg-[rgba(168,104,50,0.12)] backdrop-blur-sm text-[#7D491F] border border-[rgba(168,104,50,0.25)] font-medium',
    outline: 'bg-transparent text-cu-text-muted border border-[rgba(227,213,202,0.9)]'
  }

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-lg font-medium',
    md: 'text-xs px-2.5 py-1 rounded-lg font-medium',
    lg: 'text-sm px-3.5 py-1.5 rounded-xl font-medium'
  }

  const clickableStyles = onClick ? 'cursor-pointer hover:opacity-85 active:scale-95 transition-all' : ''

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 tracking-tight ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${clickableStyles} ${className}`}
    >
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 hover:text-red-700 transition-colors"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  )
}
