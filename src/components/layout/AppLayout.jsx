import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileTopbar from './MobileTopbar'
import { useNotifications } from '../../hooks/useNotifications'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { unreadCount } = useNotifications({ unreadOnly: true })

  return (
    <div className="app">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={unreadCount}
      />

      <main className="main">
        <MobileTopbar
          onMenuClick={() => setSidebarOpen((o) => !o)}
          unreadCount={unreadCount}
        />
        <Outlet />
      </main>
    </div>
  )
}
