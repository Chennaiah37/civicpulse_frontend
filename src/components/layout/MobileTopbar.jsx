import useAuthStore from '../../store/useAuthStore'

export default function MobileTopbar({ onMenuClick, unreadCount }) {
  const { user } = useAuthStore()
  return (
    <div className="mobile-topbar">
      <button onClick={onMenuClick}
        style={{ background: 'var(--accent-light)', border: '1px solid var(--border)', borderRadius: 9, width: 38, height: 38, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
        ☰
      </button>
      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 17, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Civic<span>Pulse</span>
      </div>
      {unreadCount > 0 && (
        <span style={{ marginLeft: 'auto', background: '#EF4444', color: 'white', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700, fontFamily: 'DM Mono, monospace' }}>
          {unreadCount}
        </span>
      )}
    </div>
  )
}
