export function Spinner({ size = 24 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
      <div className="spinner" style={{ width: size, height: size }} />
    </div>
  )
}

export function EmptyState({ icon, title, sub, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {sub && <div className="empty-sub">{sub}</div>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  )
}
