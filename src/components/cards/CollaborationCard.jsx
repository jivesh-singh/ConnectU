import React, { useState } from 'react'
import { Calendar, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { Avatar } from '../common/Avatar'
import { Button } from '../common/Button'
import { useToast } from '../../hooks/useToast'

export function CollaborationCard({ opportunity }) {
  const [hasApplied, setHasApplied] = useState(false)
  const { addToast } = useToast()

  const handleApply = (e) => {
    e.stopPropagation()
    setHasApplied(true)
    addToast(`Application sent to ${opportunity.organizer} for '${opportunity.title}'!`, 'success')
  }

  return (
    <Card hoverable className="flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <Avatar
              src={opportunity.organizerAvatar}
              name={opportunity.organizer}
              size="sm"
            />
            <div>
              <p className="text-xs font-bold text-cu-text-main leading-tight">
                {opportunity.organizer}
              </p>
              <p className="text-[11px] text-cu-text-muted flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cu-text-subtle" />
                {opportunity.deadline}
              </p>
            </div>
          </div>
          <Badge variant="accent" size="sm">
            {opportunity.spotsOpen} {opportunity.spotsOpen === 1 ? 'spot' : 'spots'} left
          </Badge>
        </div>

        <h4 className="text-sm font-bold text-cu-text-main mb-2 leading-snug">
          {opportunity.title}
        </h4>

        <p className="text-xs text-cu-text-muted leading-relaxed line-clamp-2 mb-4">
          {opportunity.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {(opportunity.tags || []).map(tag => (
            <Badge key={tag} variant="default" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-[rgba(227,213,202,0.6)] flex items-center justify-between">
        <span className="text-[11px] text-cu-text-subtle">Campus Project</span>
        <Button
          size="sm"
          variant={hasApplied ? 'outline' : 'primary'}
          icon={hasApplied ? CheckCircle2 : ArrowUpRight}
          iconPosition="right"
          onClick={handleApply}
          disabled={hasApplied}
        >
          {hasApplied ? 'Applied' : 'Express Interest'}
        </Button>
      </div>
    </Card>
  )
}
