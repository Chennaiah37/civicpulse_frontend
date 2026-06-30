export function SkeletonStats({ count = 4 }) {
  return (
    <div className="stats-grid" style={{ marginBottom: 24 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="stat-card" style={{ height: 90 }}>
          <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 28, width: '40%' }} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="complaint-card" style={{ pointerEvents: 'none' }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 11 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 8, borderRadius: 6 }} />
          <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 6 }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 12, width: '90%', marginTop: 12, borderRadius: 6 }} />
      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        <div className="skeleton" style={{ height: 22, width: 70, borderRadius: 20 }} />
        <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 20 }} />
      </div>
    </div>
  )
}
