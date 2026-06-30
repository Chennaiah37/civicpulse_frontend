import { useState } from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/Spinner'
import { timeAgo } from '../../components/ui/helpers'

export default function NotificationsPage({ toast }) {
  const [unreadOnly, setUnreadOnly] = useState(false)
  const { notifs, loading, unreadCount, markRead, markAllRead } = useNotifications({ unreadOnly })

  async function handleMarkAll() {
    try { await markAllRead(); toast?.('All marked as read', 'success') }
    catch (e) { toast?.(e.message, 'error') }
  }

  return (
    <div>
      <div className="topbar">
        <span className="page-title">🔔 Notifications</span>
        {unreadCount > 0 && (
          <span className="badge" style={{ background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE' }}>
            {unreadCount} unread
          </span>
        )}
        <div className="topbar-actions">
          <button className={`filter-chip ${unreadOnly ? 'active' : ''}`} onClick={() => setUnreadOnly((u) => !u)}>
            Unread only
          </button>
          {unreadCount > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={handleMarkAll}>Mark all read</button>
          )}
        </div>
      </div>

      <div className="content">
        {/* Page banner */}
        <div className="page-banner" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #D97706, #F59E0B)' }}>
          <img className="page-banner-img"
            src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&q=60&auto=format&fit=crop"
            alt="" />
          <div className="page-banner-overlay" style={{ background: 'linear-gradient(135deg, rgba(217,119,6,0.85), rgba(245,158,11,0.7))' }} />
          <div className="page-banner-content">
            <div className="page-banner-title">Notifications</div>
            <div className="page-banner-sub">Stay updated on your complaint status changes</div>
          </div>
        </div>

        <div className="card">
          {loading ? <Spinner /> : notifs.length === 0 ? (
            <EmptyState icon="🔔" title="No notifications" sub="You're all caught up!" />
          ) : (
            notifs.map((n) => (
              <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                <div className={`notif-dot ${n.is_read ? 'read' : ''}`} />
                <div style={{ flex: 1 }}>
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-msg">{n.message}</div>
                  <div className="notif-time">{timeAgo(n.created_at)}</div>
                </div>
                {!n.is_read && (
                  <button className="btn btn-ghost btn-sm" onClick={() => markRead(n.id)}>Mark read</button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
