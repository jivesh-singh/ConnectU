import React from 'react'

export function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
  variant = 'glass', // 'glass' | 'elevated' | 'subtle' | 'solid'
  as: Component = 'div',
  ...props
}) {
  const variantStyles = {
    // Exact glassmorphism formula from prompt specification
    glass: 'bg-[rgba(245,235,224,0.68)] backdrop-blur-[18px] border border-[rgba(255,255,255,0.55)] shadow-glass',
    elevated: 'bg-[rgba(255,255,255,0.8)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.75)] shadow-glass-md',
    subtle: 'bg-[rgba(245,235,224,0.45)] backdrop-blur-[14px] border border-[rgba(255,255,255,0.45)] shadow-soft',
    solid: 'bg-cu-card border border-cu-border shadow-soft'
  }

  const hoverStyles = hoverable
    ? 'glass-card-hover cursor-pointer active:scale-[0.99]'
    : ''

  return (
    <Component
      onClick={onClick}
      className={`rounded-[20px] p-5 sm:p-6 transition-all duration-300 text-cu-text-main ${variantStyles[variant] || variantStyles.glass} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
