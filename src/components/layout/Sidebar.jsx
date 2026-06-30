import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import { getInitials } from '../ui/helpers'
import { ROLE_META, ROLE_COLORS } from '../../styles/tokens'

const NAV = {
  citizen: [
    { path: '/',              icon: '🏠', label: 'Dashboard'     },
    { path: '/complaints',    icon: '📢', label: 'My Complaints' },
    { path: '/notifications', icon: '🔔', label: 'Notifications' },
    { path: '/profile',       icon: '👤', label: 'Profile'       },
  ],
  admin: [
    { path: '/admin/complaints', icon: '📋', label: 'All Complaints' },
    { path: '/admin/analytics',  icon: '📊', label: 'Analytics'      },
    { path: '/notifications',    icon: '🔔', label: 'Notifications'  },
    { path: '/profile',          icon: '👤', label: 'Profile'        },
  ],
  department_officer: [
    { path: '/officer/complaints', icon: '🔧', label: 'Assigned Complaints' },
    { path: '/notifications',      icon: '🔔', label: 'Notifications'       },
    { path: '/profile',            icon: '👤', label: 'Profile'             },
  ],
  superadmin: [
    { path: '/admin/complaints',   icon: '📋', label: 'All Complaints'   },
    { path: '/admin/analytics',    icon: '📊', label: 'Analytics'        },
    { path: '/admin/users',        icon: '👥', label: 'Users'            },
    { path: '/admin/departments',  icon: '🏢', label: 'Departments'      },
    { path: '/notifications',      icon: '🔔', label: 'Notifications'    },
    { path: '/profile',            icon: '👤', label: 'Profile'          },
  ],
}

export default function Sidebar({ isOpen, onClose, unreadCount }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, logout } = useAuthStore()

  const role      = user?.role || 'citizen'
  const navItems  = NAV[role] || NAV.citizen
  const initials  = getInitials(user?.full_name)
  const roleMeta  = ROLE_META[role] || ROLE_META.citizen

  function go(path) { navigate(path); onClose?.() }
  function handleLogout() { logout(); navigate('/login') }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🏛️</div>
          <div className="logo-wordmark">Civic<span className="logo-dot">Pulse</span></div>
        </div>
        <div className="logo-sub">Smart Complaint Hub</div>
      </div>

      {/* Role pill */}
      <div style={{ padding:'10px 16px 4px' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:20, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', fontSize:12, fontWeight:600, color:'#fff' }}>
          <span>{roleMeta.icon}</span>
          {roleMeta.label}
        </div>
      </div>

      {/* Nav */}
      <nav className="nav-section">
        <div className="nav-label">Navigation</div>
        {navItems.map((item) => {
          const active = location.pathname === item.path
          const badge  = item.path === '/notifications' && unreadCount > 0 ? unreadCount : null
          return (
            <button key={item.path} className={`nav-item ${active ? 'active' : ''}`} onClick={() => go(item.path)}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {badge && <span className="nav-badge urgent">{badge}</span>}
            </button>
          )
        })}
      </nav>

      <div style={{ flex:1 }} />

      {/* User chip */}
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="avatar">{initials}</div>
          <div style={{ overflow:'hidden', flex:1 }}>
            <div className="user-name">{user?.full_name}</div>
            <div className="user-role" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Sign out">⏻</button>
        </div>
      </div>
    </aside>
  )
}
