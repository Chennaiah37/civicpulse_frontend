import { STATUS_META, PRIORITY_META, ROLE_COLORS } from '../../styles/tokens'

export function StatusBadge({ status }) {
  const m = STATUS_META[status] || {}
  return (
    <span className="badge" style={{ background: m.bg || '#F0F4FF', color: m.color || '#6366F1' }}>
      {m.icon} {status}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  const m = PRIORITY_META[priority] || {}
  if (!priority) return null
  return (
    <span className="badge" style={{ background: m.bg || '#F0F4FF', color: m.color || '#6366F1' }}>
      {priority}
    </span>
  )
}

export function RoleBadge({ role }) {
  const color = ROLE_COLORS[role] || '#6366F1'
  return (
    <span className="badge" style={{ background: `${color}18`, color }}>
      {role}
    </span>
  )
}
