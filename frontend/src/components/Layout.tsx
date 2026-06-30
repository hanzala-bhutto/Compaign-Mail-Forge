import { Outlet, NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-14 items-center gap-6">
          <span className="font-semibold text-lg">MailForge</span>
          <nav className="flex gap-4">
            <NavLink
              to="/campaigns"
              className={({ isActive }) =>
                cn('text-sm transition-colors hover:text-foreground', isActive ? 'text-foreground font-medium' : 'text-muted-foreground')
              }
            >
              Campaigns
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  )
}
