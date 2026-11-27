import React, { useState } from 'react'

export function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  isOnline = false,
  className = ''
}) {
  const [imageError, setImageError] = useState(false)

  const sizeStyles = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl font-bold'
  }

  const indicatorSizes = {
    xs: 'w-2 h-2 ring-1',
    sm: 'w-2.5 h-2.5 ring-1.5',
    md: 'w-3 h-3 ring-2',
    lg: 'w-3.5 h-3.5 ring-2',
    xl: 'w-4 h-4 ring-2'
  }

  const initials = name
    ? name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      <div
        className={`rounded-full overflow-hidden flex items-center justify-center font-semibold bg-[#D5BDAF] text-[#292724] border border-[rgba(255,255,255,0.8)] shadow-xs select-none ${sizeStyles[size] || sizeStyles.md}`}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {isOnline && (
        <span
          className={`absolute bottom-0 right-0 rounded-full bg-cu-success ring-white ${indicatorSizes[size] || indicatorSizes.md}`}
          title="Online right now"
        />
      )}
    </div>
  )
}
