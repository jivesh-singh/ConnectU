import React from 'react'
import { FolderSearch } from 'lucide-react'
import { Button } from './Button'

export function EmptyState({
  icon: Icon = FolderSearch,
  title = 'No items found',
  description = 'Try adjusting your filters or check back later.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 md:p-12 bg-white/70 border border-dashed border-cu-border rounded-2xl ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-cu-secondary/50 border border-cu-border flex items-center justify-center text-cu-rose mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-cu-text-main mb-1">{title}</h4>
      <p className="text-sm text-cu-text-muted max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
