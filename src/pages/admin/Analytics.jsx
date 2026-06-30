import { useState, useEffect } from 'react'
import { analyticsApi } from '../../api/analytics'
import { SkeletonStats } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/Spinner'
import { CATEGORY_ICONS, BAR_COLORS, palette } from '../../styles/tokens'

const TABS = ['overview', 'category', 'city', 'ward', 'department']
const TAB_ICONS = { overview: '📊', category: '🏷️', city: '🏙️', ward: '📍', department: '🏢' }

function BarChart({ data, labelKey, countKey, colors = BAR_COLORS }) {
  if (!data.length) return <EmptyState icon="📊" title="No data yet" sub="" />
  const max = Math.max(...data.map((x) => x[countKey]), 1)
  return (
    <div className="bar-chart">
      {data.map((r, i) => (
        <div key={r[labelKey]} className="bar-row">
          <div className="bar-label" style={{ minWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {r[labelKey]}
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{
              width: `${Math.round((r[countKey] / max) * 100)}%`,
              background: colors[i % colors.length],
            }} />
          </div>
          <div className="bar-count">{r[countKey]}</div>
        </div>
      ))}
    </div>
  )
}

export default function Analytics({ toast }) {
  const [tab,     setTab]     = useState('overview')
  const [data,    setData]    = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [summary, byCategory, byPriority, monthlyTrend, byCity, byWard, byDept] =
          await Promise.all([
            analyticsApi.summary(), analyticsApi.byCategory(), analyticsApi.byPriority(),
            analyticsApi.monthlyTrend(), analyticsApi.byCity(), analyticsApi.byWard(), analyticsApi.byDepartment(),
          ])
        setData({ summary, byCategory, byPriority, monthlyTrend, byCity, byWard, byDept })
      } catch (e) { toast?.(e.message, 'error') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return (
    <div>
      <div className="topbar"><span className="page-title">📊 Analytics</span></div>
      <div className="content"><SkeletonStats count={6} /></div>
    </div>
  )

  const { summary, byCategory = [], byPriority = [], monthlyTrend = [], byCity = [], byWard = [], byDept = [] } = data
  const catWithIcon = byCategory.map((r) => ({ ...r, label: `${CATEGORY_ICONS[r.category] || '•'} ${r.category}` }))
  const PRIORITY_COLORS = ['#DC2626', '#D97706', '#059669']

  const STAT_CARDS = summary ? [
    { label: 'Total', value: summary.total, color: '#4F46E5', icon: '📋', cls: 'total' },
    { label: 'Pending', value: summary.pending, color: '#D97706', icon: '⏳', cls: 'pending' },
    { label: 'Assigned', value: summary.assigned, color: '#4338CA', icon: '📌', cls: '' },
    { label: 'In Progress', value: summary.in_progress, color: '#7C3AED', icon: '🔧', cls: 'inprogress' },
    { label: 'Resolved', value: summary.resolved, color: '#059669', icon: '✅', cls: 'resolved' },
    { label: 'Rejected', value: summary.rejected, color: '#DC2626', icon: '❌', cls: '' },
    { label: 'Resolution Rate', value: `${summary.resolution_rate_percent}%`, color: '#0891B2', icon: '📈', cls: '' },
  ] : []

  return (
    <div>
      <div className="topbar"><span className="page-title">📊 Analytics Dashboard</span></div>
      <div className="content">
        {/* Page Banner */}
        <div className="page-banner" style={{ marginBottom: 24 }}>
          <img className="page-banner-img"
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=60&auto=format&fit=crop"
            alt="" />
          <div className="page-banner-overlay" style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.88), rgba(124,58,237,0.78))' }} />
          <div className="page-banner-content">
            <div className="page-banner-title">Analytics & Insights</div>
            <div className="page-banner-sub">Data-driven overview of civic complaint trends and resolutions</div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <button key={t}
              className={`filter-chip ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
              style={{ fontSize: 13 }}>
              {TAB_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'overview' && summary && (
          <>
            <div className="stats-grid" style={{ marginBottom: 24 }}>
              {STAT_CARDS.map(({ label, value, color, icon, cls }) => (
                <div key={label} className={`stat-card ${cls}`}>
                  <div className="stat-icon">{icon}</div>
                  <div className="stat-label">{label}</div>
                  <div className="stat-value" style={{ color }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Monthly trend */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><span className="card-title">📈 Monthly Trend</span></div>
              {monthlyTrend.length === 0 ? (
                <EmptyState icon="📈" title="No trend data yet" sub="" />
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 130, padding: '8px 0' }}>
                  {(() => {
                    const maxM = Math.max(...monthlyTrend.map((x) => x.count), 1)
                    return monthlyTrend.map((r, i) => (
                      <div key={r.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'DM Mono, monospace' }}>{r.count}</div>
                        <div style={{
                          width: '100%', borderRadius: '6px 6px 0 0',
                          height: `${Math.max(Math.round((r.count / maxM) * 90), 4)}px`,
                          background: `linear-gradient(180deg, ${BAR_COLORS[i % BAR_COLORS.length]}, ${BAR_COLORS[i % BAR_COLORS.length]}88)`,
                          minHeight: 4, transition: 'height 0.5s',
                        }} />
                        <div style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'DM Mono, monospace', textAlign: 'center' }}>
                          {r.month?.slice(5) || r.month}
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header"><span className="card-title">🎯 By Priority</span></div>
              <BarChart data={byPriority} labelKey="priority" countKey="count" colors={PRIORITY_COLORS} />
            </div>
          </>
        )}

        {tab === 'category' && (
          <div className="card">
            <div className="card-header"><span className="card-title">🏷️ Complaints by Category</span></div>
            <BarChart data={catWithIcon} labelKey="label" countKey="count" />
          </div>
        )}
        {tab === 'city' && (
          <div className="card">
            <div className="card-header"><span className="card-title">🏙️ Top Cities</span></div>
            <BarChart data={byCity} labelKey="city" countKey="count" colors={['#4F46E5', '#7C3AED', '#0891B2', '#059669', '#D97706']} />
          </div>
        )}
        {tab === 'ward' && (
          <div className="card">
            <div className="card-header"><span className="card-title">📍 Top Wards</span></div>
            <BarChart data={byWard} labelKey="ward" countKey="count" colors={['#7C3AED', '#4F46E5', '#DB2777', '#0891B2']} />
          </div>
        )}
        {tab === 'department' && (
          <div className="card">
            <div className="card-header"><span className="card-title">🏢 By Department</span></div>
            <BarChart data={byDept} labelKey="department" countKey="count" colors={['#059669', '#10B981', '#34D399']} />
          </div>
        )}
      </div>
    </div>
  )
}
