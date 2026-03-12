import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/automations', label: 'Automations' },
  { to: '/skills', label: 'Skills' },
  { to: '/settings', label: 'Settings' },
]

export const SidebarNav = () => {
  return (
    <nav style={{ display: 'grid', gap: '4px' }}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            display: 'block',
            padding: '8px 12px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.85rem',
            color: isActive ? '#fff' : '#a0a0b8',
            background: isActive ? '#2a2a45' : 'transparent',
            transition: 'all 150ms ease',
          })}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
