import React from 'react'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  className = '',
  type = 'button',
  ...props
}) {
  // Linear & Apple-inspired precision
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cu-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none'

  const variants = {
    // Deep warm espresso with subtle top specular highlight
    primary: 'bg-[#292724] text-[#F5EBE0] hover:bg-[#1C1A18] shadow-sm hover:shadow-md border border-[rgba(255,255,255,0.12)]',
    // Warm accent button
    accent: 'bg-[#D5BDAF] text-[#292724] hover:bg-[#C7ADA0] shadow-sm border border-[rgba(255,255,255,0.5)] font-semibold',
    // Frosted glass secondary button
    secondary: 'bg-[rgba(245,235,224,0.65)] backdrop-blur-md text-cu-text-main hover:bg-[rgba(245,235,224,0.9)] border border-[rgba(255,255,255,0.6)] shadow-soft',
    // Clean translucent outline
    outline: 'border border-[rgba(227,213,202,0.85)] bg-[rgba(255,255,255,0.35)] backdrop-blur-sm text-cu-text-main hover:bg-[rgba(245,235,224,0.6)] hover:border-cu-text-main',
    // Minimal ghost
    ghost: 'bg-transparent text-cu-text-muted hover:text-cu-text-main hover:bg-[rgba(214,204,194,0.3)]',
    // Danger
    danger: 'bg-red-50/80 backdrop-blur-sm text-red-700 border border-red-200 hover:bg-red-100'
  }

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 font-medium tracking-tight',
    md: 'text-sm px-4 py-2.5 gap-2 tracking-tight',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold tracking-tight'
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
    </button>
  )
}
