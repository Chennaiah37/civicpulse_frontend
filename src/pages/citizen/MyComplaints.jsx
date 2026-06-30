import { useState } from 'react'
import { useComplaints } from '../../hooks/useComplaints'
import ComplaintCard from '../../components/complaints/ComplaintCard'
import ComplaintDetail from '../../components/complaints/ComplaintDetail'
import SubmitComplaintModal from '../../components/complaints/SubmitComplaintModal'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/Spinner'
import { Pagination } from '../../components/ui/Pagination'

const STATUS_FILTERS = ['', 'Pending', 'In Progress', 'Resolved', 'Rejected']
const FILTER_COLORS = {
  '': null,
  Pending: '#D97706',
  'In Progress': '#7C3AED',
  Resolved: '#059669',
  Rejected: '#DC2626',
}

export default function MyComplaints({ toast }) {
  const [selected,     setSelected]     = useState(null)
  const [showSubmit,   setShowSubmit]   = useState(false)
  const [statusFilter, setStatusFilter] = useState('')

  const { items, total, totalPages, page, setPage, setFilters, loading, updateItem, prependItem } =
    useComplaints({ mine: true, pageSize: 10 })

  function applyStatus(s) {
    setStatusFilter(s)
    setPage(1)
    setFilters(s ? { status_filter: s } : {})
  }

  return (
    <div>
      <div className="topbar">
        <span className="page-title">📢 My Complaints</span>
        <span style={{ color: '#9CA3AF', fontSize: 13, fontFamily: 'DM Mono, monospace' }}>{total} total</span>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => setShowSubmit(true)}>
            + New Complaint
          </button>
        </div>
      </div>

      <div className="content">
        {/* Page banner */}
        <div className="page-banner" style={{ marginBottom: 24 }}>
          <img className="page-banner-img"
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=60&auto=format&fit=crop"
            alt="" />
          <div className="page-banner-overlay" />
          <div className="page-banner-content">
            <div className="page-banner-title">My Complaints</div>
            <div className="page-banner-sub">Track and manage all your reported civic issues</div>
          </div>
        </div>

        {/* Status filters */}
        <div className="filters">
          {STATUS_FILTERS.map((s) => (
            <button key={s} className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
              onClick={() => applyStatus(s)}
              style={statusFilter === s && s && FILTER_COLORS[s] ? {
                background: FILTER_COLORS[s], borderColor: FILTER_COLORS[s]
              } : {}}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="complaint-list">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : items.length === 0 ? (
          <EmptyState icon="📭" title="No complaints yet" sub="Submit your first civic issue to get started"
            action={<button className="btn btn-primary" onClick={() => setShowSubmit(true)}>+ Submit Complaint</button>}
          />
        ) : (
          <>
            <div className="complaint-list">
              {items.map((c) => <ComplaintCard key={c.id} complaint={c} onClick={setSelected} />)}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {showSubmit && (
        <SubmitComplaintModal onClose={() => setShowSubmit(false)} onSuccess={(c) => prependItem(c)} toast={toast} />
      )}
      {selected && (
        <ComplaintDetail complaint={selected} onClose={() => setSelected(null)}
          isAdmin={false} onUpdate={(u) => { updateItem(u); setSelected(u) }} toast={toast} />
      )}
    </div>
  )
}
