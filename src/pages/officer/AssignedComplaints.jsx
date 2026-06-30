import { useState } from 'react'
import { complaintsApi } from '../../api/complaints'
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/Spinner'
import { Pagination } from '../../components/ui/Pagination'
import { timeAgo } from '../../components/ui/helpers'
import { STATUS_META, CATEGORY_ICONS } from '../../styles/tokens'
import { useComplaints } from '../../hooks/useComplaints'

const STATUSES = ['', 'Assigned', 'In Progress', 'Resolved']

export default function AssignedComplaints({ toast }) {
  const [selected,     setSelected]     = useState(null)
  const [updating,     setUpdating]     = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [progressNote, setProgressNote] = useState('')
  const [newStatus,    setNewStatus]    = useState('In Progress')

  const { items, total, totalPages, page, setPage, setFilters, loading, updateItem } =
    useComplaints({ mine: false, assigned: true, pageSize: 20 })

  function handleFilter(v) {
    setStatusFilter(v)
    setFilters(v ? { status_filter: v } : {})
    setPage(1)
  }

  function openComplaint(c) {
    setSelected(c)
    setProgressNote(c.progress_note || '')
    setNewStatus('In Progress')
  }

  async function handleProgressUpdate(e) {
    e.preventDefault()
    if (!selected) return
    setUpdating(true)
    try {
      const updated = await complaintsApi.updateProgress(selected.id, {
        status: newStatus,
        progress_note: progressNote || undefined,
      })
      updateItem(updated)
      toast(`Complaint marked as "${newStatus}"`, 'success')
      setSelected(updated)
      setProgressNote('')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setUpdating(false)
    }
  }

  const canUpdate = selected && !['Resolved', 'Rejected'].includes(selected.status)

  return (
    <div>
      <div className="topbar">
        <span className="page-title">🔧 Assigned Complaints</span>
        <span style={{ color:'#9CA3AF', fontSize:13, fontFamily:'DM Mono, monospace' }}>{total} complaints</span>
      </div>

      <div className="content">
        {/* Banner */}
        <div className="page-banner" style={{ marginBottom:24, background:'linear-gradient(135deg,#D97706,#F59E0B)' }}>
          <div className="page-banner-overlay" style={{ background:'linear-gradient(135deg,rgba(217,119,6,0.85),rgba(245,158,11,0.7))' }} />
          <div className="page-banner-content">
            <div className="page-banner-title">🔧 Department Officer Portal</div>
            <div className="page-banner-sub">Update progress and resolve complaints assigned to you or your department</div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="card" style={{ marginBottom:16 }}>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
            <select className="form-input" value={statusFilter} style={{ maxWidth:180 }}
              onChange={e => handleFilter(e.target.value)}>
              <option value="">All Status</option>
              {STATUSES.slice(1).map(s => <option key={s}>{s}</option>)}
            </select>
            <span style={{ fontSize:13, color:'#9CA3AF', marginLeft:'auto' }}>
              Click a row to view details and update
            </span>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 390px' : '1fr', gap:20 }}>

          {/* Left: table list */}
          <div>
            {loading ? (
              <div className="complaint-list">{Array.from({length:5}).map((_,i) => <SkeletonCard key={i} />)}</div>
            ) : items.length === 0 ? (
              <EmptyState icon="📭" title="No assigned complaints" sub="You have no complaints assigned yet" />
            ) : (
              <div className="card" style={{ padding:0, overflow:'hidden' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Department</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(c => {
                      const isSelected = selected?.id === c.id
                      const catIcon = CATEGORY_ICONS[c.category] || '📋'
                      return (
                        <tr key={c.id}
                          onClick={() => openComplaint(c)}
                          style={{
                            cursor: 'pointer',
                            background: isSelected ? '#FFFBEB' : '',
                            borderLeft: isSelected ? '3px solid #F59E0B' : '3px solid transparent',
                          }}>
                          <td style={{ fontFamily:'monospace', fontSize:12, color:'#9CA3AF' }}>#{c.id}</td>
                          <td style={{ fontWeight:500, maxWidth:220 }}>
                            <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title}</div>
                            {c.admin_note && (
                              <div style={{ fontSize:11, color:'#4F46E5', marginTop:2 }}>📋 {c.admin_note}</div>
                            )}
                          </td>
                          <td style={{ fontSize:13 }}>{catIcon} {c.category}</td>
                          <td><StatusBadge status={c.status} /></td>
                          <td><PriorityBadge priority={c.priority} /></td>
                          <td style={{ fontSize:12, color:'#6B7280' }}>{c.department || '—'}</td>
                          <td style={{ fontSize:12, color:'#9CA3AF' }}>{timeAgo(c.created_at)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            )}
          </div>

          {/* Right: detail + update panel */}
          {selected && (
            <div style={{ position:'sticky', top:80, alignSelf:'start' }}>
              <div className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div style={{ fontWeight:600, fontSize:15 }}>#{selected.id} Details</div>
                  <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#9CA3AF' }}>×</button>
                </div>

                <div style={{ fontWeight:600, fontSize:14, marginBottom:8 }}>{selected.title}</div>

                <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                  <StatusBadge status={selected.status} />
                  <PriorityBadge priority={selected.priority} />
                </div>

                <div style={{ fontSize:13, color:'#374151', lineHeight:1.6, marginBottom:12 }}>{selected.description}</div>

                {selected.address && (
                  <div style={{ fontSize:12, color:'#6B7280', marginBottom:8 }}>📍 {selected.address}</div>
                )}
                {selected.department && (
                  <div style={{ padding:'6px 10px', background:'#F3F4F6', borderRadius:6, fontSize:13, marginBottom:10 }}>
                    <strong>Department:</strong> {selected.department}
                  </div>
                )}
                {selected.admin_note && (
                  <div style={{ padding:'8px 12px', background:'#EEF2FF', borderRadius:8, fontSize:13, color:'#4F46E5', marginBottom:10 }}>
                    <strong>Admin Note:</strong> {selected.admin_note}
                  </div>
                )}
                {selected.progress_note && (
                  <div style={{ padding:'8px 12px', background:'#D1FAE5', borderRadius:8, fontSize:13, color:'#065F46', marginBottom:10 }}>
                    <strong>Last Update:</strong> {selected.progress_note}
                  </div>
                )}

                {selected.image_path && (
                  <img
                    src={`${(import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '')}/${selected.image_path}`}
                    alt="complaint"
                    style={{ width:'100%', borderRadius:8, marginBottom:12, objectFit:'cover', maxHeight:160 }}
                  />
                )}

                {/* Timeline */}
                {selected.history?.length > 0 && (
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#6B7280', marginBottom:8 }}>TIMELINE</div>
                    {selected.history.map((h, i) => (
                      <div key={i} style={{ display:'flex', gap:8, fontSize:12, color:'#374151', marginBottom:6 }}>
                        <span style={{ color:'#9CA3AF', whiteSpace:'nowrap' }}>{new Date(h.created_at).toLocaleDateString()}</span>
                        <span>{h.old_status || '—'} → <strong>{h.new_status}</strong></span>
                        {h.note && <span style={{ color:'#6B7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>· {h.note}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Update form */}
                {canUpdate ? (
                  <form onSubmit={handleProgressUpdate}>
                    <div style={{ borderTop:'1px solid #E5E7EB', paddingTop:14 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:10 }}>UPDATE PROGRESS</div>
                      <select className="form-input" value={newStatus}
                        onChange={e => setNewStatus(e.target.value)} style={{ marginBottom:10 }}>
                        <option value="In Progress">Mark as In Progress</option>
                        <option value="Resolved">Mark as Resolved ✅</option>
                      </select>
                      <textarea className="form-input"
                        placeholder="Progress note (optional)..."
                        value={progressNote}
                        onChange={e => setProgressNote(e.target.value)}
                        rows={3}
                        style={{ resize:'vertical', marginBottom:10 }}
                      />
                      <button className="btn btn-primary" type="submit" disabled={updating} style={{ width:'100%' }}>
                        {updating ? 'Updating...' : 'Update Status'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ padding:'10px 12px', background:'#D1FAE5', borderRadius:8, fontSize:13, color:'#065F46', textAlign:'center' }}>
                    ✅ This complaint is {selected.status}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
