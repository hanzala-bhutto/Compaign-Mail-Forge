import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Mail, Send, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const navItems = [{ to: '/campaigns', label: 'Campaigns', icon: Send }]

function Brand() {
  return (
    <div className="flex items-center gap-2 px-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Mail className="h-4 w-4" />
      </div>
      <span className="font-semibold text-lg tracking-tight">MailForge</span>
    </div>
  )
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-2">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="hidden w-60 shrink-0 border-r bg-card md:flex md:flex-col md:gap-6 md:py-6">
        <Brand />
        <NavList />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/60 md:hidden">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 py-6">
              <div className="flex flex-col gap-6">
                <Brand />
                <NavList onNavigate={() => setMobileNavOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-semibold">MailForge</span>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
