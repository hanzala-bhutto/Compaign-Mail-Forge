import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

type StatCardVariant = 'success' | 'info' | 'accent' | 'warning' | 'destructive'

interface StatCardProps {
  label: string
  value: number
  variant: StatCardVariant
  icon: LucideIcon
}

const variantClasses: Record<StatCardVariant, string> = {
  success: 'text-chart-1 bg-chart-1/10',
  info: 'text-chart-2 bg-chart-2/10',
  accent: 'text-chart-3 bg-chart-3/10',
  warning: 'text-chart-4 bg-chart-4/10',
  destructive: 'text-chart-5 bg-chart-5/10',
}

export function StatCard({ label, value, variant, icon: Icon }: StatCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', variantClasses[variant])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground truncate">{label}</p>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
