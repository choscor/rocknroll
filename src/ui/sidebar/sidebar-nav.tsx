import { NavLink } from 'react-router-dom'
import { Bot, Clock3, Settings2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/chat', label: 'New thread', icon: Sparkles },
  { to: '/automations', label: 'Automations', icon: Clock3 },
  { to: '/skills', label: 'Skills', icon: Bot },
]

export const SidebarNav = () => {
  return (
    <nav className="grid gap-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
            )
          }
        >
          <item.icon className="size-4" />
          {item.label}
        </NavLink>
      ))}
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          cn(
            'mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
          )
        }
      >
        <Settings2 className="size-4" />
        Settings
      </NavLink>
    </nav>
  )
}
