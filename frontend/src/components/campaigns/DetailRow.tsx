import type { LucideIcon } from 'lucide-react'

interface DetailRowProps {
  label: string
  value: string
  icon?: LucideIcon
}

export function DetailRow({ label, value, icon: Icon }: DetailRowProps) {
  return (
    <div className="flex items-center gap-3 py-1">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
      <span className="text-muted-foreground w-20 shrink-0 text-sm">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
