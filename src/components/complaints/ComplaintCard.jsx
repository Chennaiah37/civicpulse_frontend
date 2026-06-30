import { StatusBadge, PriorityBadge } from '../ui/Badge'
import { timeAgo } from '../ui/helpers'
import { CATEGORY_ICONS } from '../../styles/tokens'

const CATEGORY_COLORS = {
  Garbage: '#D97706', Pothole: '#7C3AED', 'Water Leakage': '#0891B2',
  Streetlight: '#F59E0B', Sewage: '#059669', 'Road Damage': '#DC2626',
  'Noise Pollution': '#DB2777', Other: '#6366F1',
}

export default function ComplaintCard({ complaint, onClick }) {
  const { id, title, description, category, status, priority, city, department, created_at } = complaint
  const catColor = CATEGORY_COLORS[category] || '#4F46E5'

  return (
    <div className="complaint-card" onClick={() => onClick?.(complaint)}
      style={{ borderLeft: `4px solid ${catColor}`, paddingLeft: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 11, flexShrink: 0,
          background: `${catColor}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {CATEGORY_ICONS[category] || '📋'}
        </div>
        <div style={{ flex: 1 }}>
          <div className="complaint-card-title">{title}</div>
          <div className="complaint-card-meta">
            <span style={{ fontFamily: 'DM Mono, monospace' }}>#{id}</span>
            {city && <span>📍 {city}</span>}
            <span>{timeAgo(created_at)}</span>
          </div>
        </div>
      </div>

      {description && (
        <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 10, lineHeight: 1.5,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {description}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <StatusBadge status={status} />
        <PriorityBadge priority={priority} />
        {category && (
          <span className="badge" style={{ background: `${catColor}15`, color: catColor }}>
            {category}
          </span>
        )}
        {department && (
          <span style={{ fontSize: 11, color: '#A5B4FC', marginLeft: 'auto' }}>🏢 {department}</span>
        )}
      </div>
    </div>
  )
}
