import { FileEdit, CalendarClock, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Campaign } from '@/types/campaign'

interface StatusBadgeProps {
  status: Campaign['status']
}

const statusConfig = {
  draft: { icon: FileEdit, variant: 'secondary' as const },
  scheduled: { icon: CalendarClock, variant: 'warning' as const },
  sent: { icon: CheckCircle2, variant: 'success' as const },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { icon: Icon, variant } = statusConfig[status]
  return (
    <Badge variant={variant}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  )
}
