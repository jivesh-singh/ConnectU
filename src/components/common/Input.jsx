import React, { forwardRef } from 'react'

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    className = '',
    containerClassName = '',
    id,
    type = 'text',
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={`flex flex-col gap-1.5 text-left ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-cu-text-muted">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-cu-text-subtle">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            w-full bg-[rgba(255,255,255,0.65)] backdrop-blur-md border border-[rgba(227,213,202,0.85)]
            text-cu-text-main text-sm rounded-xl px-3.5 py-2.5 transition-all
            placeholder:text-cu-text-subtle/70
            focus:outline-none focus:border-[#292724] focus:bg-white focus:ring-1 focus:ring-[#292724]
            shadow-xs
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-400' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
      {helperText && !error && <span className="text-xs text-cu-text-subtle">{helperText}</span>}
    </div>
  )
})
