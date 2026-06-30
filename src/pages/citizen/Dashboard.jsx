import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import { complaintsApi } from '../../api/complaints'
import { StatusBadge } from '../../components/ui/Badge'
import { SkeletonStats } from '../../components/ui/Skeleton'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/Spinner'
import { timeAgo } from '../../components/ui/helpers'
import { STATUS_META, CATEGORY_ICONS } from '../../styles/tokens'
import SubmitComplaintModal from '../../components/complaints/SubmitComplaintModal'

export default function Dashboard({ toast }) {
  const { user } = useAuthStore()
  const navigate  = useNavigate()

  const [stats,       setStats]       = useState(null)
  const [recent,      setRecent]      = useState([])
  const [loadStats,   setLoadStats]   = useState(true)
  const [loadRecent,  setLoadRecent]  = useState(true)
  const [showSubmit,  setShowSubmit]  = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const recentData = await complaintsApi.getMine({ page: 1, page_size: 5 })
        setRecent(recentData.items ?? [])
        setLoadRecent(false)
        const allData = await complaintsApi.getMine({ page: 1, page_size: 100 })
        const items = allData.items ?? []
        setStats({
          total:      allData.total,
          pending:    items.filter((c) => c.status === 'Pending').length,
          assigned:   items.filter((c) => c.status === 'Assigned').length,
          inProgress: items.filter((c) => c.status === 'In Progress').length,
          resolved:   items.filter((c) => c.status === 'Resolved').length,
        })
        setLoadStats(false)
      } catch {
        setLoadStats(false); setLoadRecent(false)
      }
    }
    load()
  }, [])

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.full_name?.split(' ')[0] || 'there'

  const QUICK_ACTIONS = [
    { icon: '📢', title: 'New Complaint',  sub: 'Report a civic issue',      action: () => setShowSubmit(true), color: '#EEF2FF', iconBg: '#4F46E5' },
    { icon: '📋', title: 'My Complaints',  sub: 'View all your submissions', action: () => navigate('/complaints'), color: '#EDE9FE', iconBg: '#7C3AED' },
    { icon: '🔔', title: 'Notifications',  sub: 'Status updates & alerts',   action: () => navigate('/notifications'), color: '#FEF3C7', iconBg: '#D97706' },
    { icon: '👤', title: 'My Profile',     sub: 'Manage account details',    action: () => navigate('/profile'), color: '#D1FAE5', iconBg: '#059669' },
  ]

  const STAT_CARDS = stats ? [
    { label: 'Total Filed', value: stats.total, icon: '📊', cls: 'total', color: '#4F46E5' },
    { label: 'Pending',     value: stats.pending, icon: '⏳', cls: 'pending', color: '#D97706' },
    { label: 'Assigned',    value: stats.assigned, icon: '📌', cls: '', color: '#4338CA' },
    { label: 'In Progress', value: stats.inProgress, icon: '🔧', cls: 'inprogress', color: '#7C3AED' },
    { label: 'Resolved',    value: stats.resolved, icon: '✅', cls: 'resolved', color: '#059669' },
  ] : []

  return (
    <div>
      <div className="topbar">
        <span className="page-title">🏠 Dashboard</span>
      </div>

      <div className="content">
        {/* Hero Banner with city image */}
        <div className="dash-hero" style={{ marginBottom: 24 }}>
          <img
            src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=70&auto=format&fit=crop"
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15, borderRadius: 'inherit' }}
          />
          <div className="dash-greeting" style={{ position: 'relative', zIndex: 1 }}>
            {greeting}, {firstName} 👋
          </div>
          <div className="dash-sub" style={{ position: 'relative', zIndex: 1 }}>
            Track your complaints and stay updated on civic issues in your area.
          </div>
          <button
            className="btn"
            style={{ marginTop: 18, background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 1 }}
            onClick={() => setShowSubmit(true)}
          >
            📢 Report an Issue
          </button>
        </div>

        {/* Stats */}
        {loadStats ? <SkeletonStats count={4} /> : stats && (
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            {STAT_CARDS.map((s) => (
              <div key={s.label} className={`stat-card ${s.cls}`}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {QUICK_ACTIONS.map((a) => (
            <button key={a.title} className="quick-action" onClick={a.action}
              style={{ background: a.color, borderColor: 'transparent' }}>
              <span className="quick-action-icon" style={{ background: a.iconBg + '22', fontSize: 22 }}>{a.icon}</span>
              <div>
                <div className="quick-action-title">{a.title}</div>
                <div className="quick-action-sub">{a.sub}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🕐 Recent Activity</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/complaints')}>
              View all →
            </button>
          </div>
          {loadRecent ? <Spinner /> : recent.length === 0 ? (
            <EmptyState icon="📭" title="No complaints yet" sub="Submit your first issue above" />
          ) : (
            <div className="timeline">
              {recent.map((c) => {
                const m = STATUS_META[c.status] || {}
                return (
                  <div key={c.id} className="timeline-item">
                    <div className="timeline-dot" style={{ background: m.color || '#A5B4FC', width: 12, height: 12 }} />
                    <div className="timeline-content">
                      <div className="timeline-title">
                        {CATEGORY_ICONS[c.category] || '📋'} {c.title}
                      </div>
                      <div className="timeline-meta" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>#{c.id}</span>
                        <StatusBadge status={c.status} />
                        <span>{timeAgo(c.created_at)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showSubmit && (
        <SubmitComplaintModal
          onClose={() => setShowSubmit(false)}
          onSuccess={() => { setShowSubmit(false); navigate('/complaints') }}
          toast={toast}
        />
      )}
    </div>
  )
}
