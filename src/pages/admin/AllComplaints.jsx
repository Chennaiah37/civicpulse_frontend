import { useState, useEffect } from 'react'
import { complaintsApi } from '../../api/complaints'
import { adminApi } from '../../api/admin'
import { departmentsApi } from '../../api/departments'
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/Spinner'
import { Pagination } from '../../components/ui/Pagination'
import { timeAgo } from '../../components/ui/helpers'
import { CATEGORY_ICONS, STATUS_META } from '../../styles/tokens'
import { useComplaints } from '../../hooks/useComplaints'
import useAuthStore from '../../store/useAuthStore'

const STATUSES   = ['','Pending','Assigned','In Progress','Resolved','Rejected']
const CATEGORIES = ['','Garbage','Pothole','Water Leakage','Streetlight','Sewage','Road Damage','Noise Pollution','Other']
const PRIORITIES = ['','High','Medium','Low']

export default function AllComplaints({ toast }) {
  const { user } = useAuthStore()
  const [selected,      setSelected]      = useState(null)
  const [status,        setStatus]        = useState('')
  const [category,      setCategory]      = useState('')
  const [priority,      setPriority]      = useState('')
  const [city,          setCity]          = useState('')
  const [assigning,     setAssigning]     = useState(false)
  const [rejecting,     setRejecting]     = useState(false)

  // Assign form state
  const [departments,   setDepartments]   = useState([])    // ← fetch on mount
  const [deptLoading,   setDeptLoading]   = useState(true)  // ← show loading state
  const [officers,      setOfficers]      = useState([])
  const [officersLoading, setOfficersLoading] = useState(false)
  const [assignDeptId,  setAssignDeptId]  = useState('')
  const [assignDept,    setAssignDept]    = useState('')
  const [assignOfficer, setAssignOfficer] = useState('')
  const [adminNote,     setAdminNote]     = useState('')
  const [rejectNote,    setRejectNote]    = useState('')
  const [activePanel,   setActivePanel]   = useState(null)  // 'assign' | 'reject'

  const { items, total, totalPages, page, setPage, setFilters, loading, updateItem } =
    useComplaints({ mine: false, assigned: false, pageSize: 20 })

  // ── Fetch departments once on mount — not lazily ──────────
  useEffect(() => {
    departmentsApi.getAll()
      .then(d => setDepartments(d))
      .catch(err => toast(`Could not load departments: ${err.message}`, 'error'))
      .finally(() => setDeptLoading(false))
  }, [])

  function applyFilters(patch) {
    const next = { status, category, priority, city, ...patch }
    setFilters({
      ...(next.status   ? { status_filter: next.status } : {}),
      ...(next.category ? { category:      next.category } : {}),
      ...(next.priority ? { priority:      next.priority } : {}),
      ...(next.city     ? { city:          next.city }    : {}),
    })
    setPage(1)
  }

  function openComplaint(c) {
    setSelected(c)
    setActivePanel(null)
    setAdminNote('')
    setRejectNote('')
    setAssignDeptId('')
    setAssignDept('')
    setAssignOfficer('')
    setOfficers([])
  }

  async function handleDeptChange(deptId) {
    setAssignDeptId(deptId)
    const dept = departments.find(d => d.id === parseInt(deptId))
    setAssignDept(dept?.name || '')
    setAssignOfficer('')
    setOfficers([])
    if (deptId) {
      setOfficersLoading(true)
      try {
        const o = await adminApi.getOfficers({ dept_id: deptId })
        setOfficers(o)
      } catch {
        setOfficers([])
      } finally {
        setOfficersLoading(false)
      }
    }
  }

  async function handleAssign(e) {
    e.preventDefault()
    if (!assignDeptId) { toast('Please select a department', 'error'); return }
    setAssigning(true)
    try {
      const updated = await complaintsApi.assign(selected.id, {
        department: assignDept,
        dept_id:    parseInt(assignDeptId),
        officer_id: assignOfficer ? parseInt(assignOfficer) : null,
        admin_note: adminNote || null,
      })
      updateItem(updated)
      setSelected(updated)
      setActivePanel(null)
      toast('Complaint assigned successfully ✅', 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setAssigning(false)
    }
  }

  async function handleReject(e) {
    e.preventDefault()
    setRejecting(true)
    try {
      const updated = await complaintsApi.review(selected.id, {
        status: 'Rejected',
        admin_note: rejectNote || null,
      })
      updateItem(updated)
      setSelected(updated)
      setActivePanel(null)
      toast('Complaint rejected', 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setRejecting(false)
    }
  }

  // Admin can act on Pending AND re-assign already Assigned complaints
  const canAssign = selected && ['Pending', 'Assigned'].includes(selected.status)
  const canReject = selected && selected.status === 'Pending'

  return (
    <div>
      <div className="topbar">
        <span className="page-title">📋 All Complaints</span>
        <span style={{ color:'#9CA3AF', fontSize:13, fontFamily:'DM Mono, monospace' }}>{total} total</span>
      </div>

      <div className="content">
        <div className="page-banner" style={{ marginBottom:24, background:'linear-gradient(135deg,#059669,#10B981)' }}>
          <div className="page-banner-overlay" style={{ background:'linear-gradient(135deg,rgba(5,150,105,0.85),rgba(16,185,129,0.7))' }} />
          <div className="page-banner-content">
            <div className="page-banner-title">🛡️ Admin — Complaint Management</div>
            <div className="page-banner-sub">Review incoming complaints, assign to departments and officers</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom:16 }}>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
            {[
              { label:'All Status',     value:status,   vals:STATUSES,   set:(v)=>{ setStatus(v);   applyFilters({status:v})   }},
              { label:'All Categories', value:category, vals:CATEGORIES, set:(v)=>{ setCategory(v); applyFilters({category:v}) }},
              { label:'All Priority',   value:priority, vals:PRIORITIES, set:(v)=>{ setPriority(v); applyFilters({priority:v}) }},
            ].map(({label,value,vals,set}) => (
              <select key={label} className="form-input" value={value} style={{ maxWidth:160 }}
                onChange={e => set(e.target.value)}>
                <option value="">{label}</option>
                {vals.slice(1).map(v => <option key={v}>{v}</option>)}
              </select>
            ))}
            <input className="form-input" placeholder="🏙️ Filter by city" value={city}
              style={{ maxWidth:160 }}
              onChange={e => { setCity(e.target.value); applyFilters({city:e.target.value}) }} />
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:selected ? '1fr 420px' : '1fr', gap:20 }}>

          {/* ── Complaint list ── */}
          <div>
            {loading ? (
              <div className="complaint-list">{Array.from({length:5}).map((_,i) => <SkeletonCard key={i}/>)}</div>
            ) : items.length === 0 ? (
              <EmptyState icon="📭" title="No complaints found" sub="Try adjusting filters" />
            ) : (
              <div className="card" style={{ padding:0, overflow:'hidden' }}>
                <table className="table">
                  <thead>
                    <tr><th>#</th><th>Title</th><th>Category</th><th>Status</th><th>Priority</th><th>City</th><th>Time</th></tr>
                  </thead>
                  <tbody>
                    {items.map(c => {
                      const isSelected = selected?.id === c.id
                      return (
                        <tr key={c.id}
                          style={{ cursor:'pointer', background:isSelected?'#EEF2FF':'', borderLeft:isSelected?'3px solid #4F46E5':'3px solid transparent' }}
                          onClick={() => openComplaint(c)}>
                          <td style={{ fontFamily:'monospace', fontSize:12, color:'#9CA3AF' }}>#{c.id}</td>
                          <td style={{ fontWeight:500, maxWidth:200 }}>
                            <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title}</div>
                            {c.department && <div style={{ fontSize:11, color:'#6B7280' }}>→ {c.department}</div>}
                          </td>
                          <td>{CATEGORY_ICONS[c.category]||'📋'} {c.category}</td>
                          <td><StatusBadge status={c.status}/></td>
                          <td><PriorityBadge priority={c.priority}/></td>
                          <td style={{ fontSize:12 }}>{c.city||'—'}</td>
                          <td style={{ fontSize:12, color:'#9CA3AF' }}>{timeAgo(c.created_at)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
          </div>

          {/* ── Detail + action panel ── */}
          {selected && (
            <div style={{ position:'sticky', top:80, alignSelf:'start' }}>
              <div className="card">
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                  <div style={{ fontWeight:600 }}>#{selected.id} Details</div>
                  <button onClick={() => setSelected(null)}
                    style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#9CA3AF' }}>×</button>
                </div>

                <div style={{ fontWeight:600, fontSize:15, marginBottom:8 }}>{selected.title}</div>
                <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                  <StatusBadge status={selected.status}/>
                  <PriorityBadge priority={selected.priority}/>
                </div>
                <div style={{ fontSize:13, color:'#374151', lineHeight:1.6, marginBottom:10 }}>{selected.description}</div>
                {selected.address && <div style={{ fontSize:12, color:'#6B7280', marginBottom:8 }}>📍 {selected.address}</div>}
                {selected.admin_note && (
                  <div style={{ padding:'8px 12px', background:'#EEF2FF', borderRadius:8, fontSize:13, color:'#4F46E5', marginBottom:10 }}>
                    <strong>Admin Note:</strong> {selected.admin_note}
                  </div>
                )}
                {selected.progress_note && (
                  <div style={{ padding:'8px 12px', background:'#D1FAE5', borderRadius:8, fontSize:13, color:'#065F46', marginBottom:10 }}>
                    <strong>Officer Update:</strong> {selected.progress_note}
                  </div>
                )}
                {selected.department && (
                  <div style={{ padding:'8px 12px', background:'#F3F4F6', borderRadius:8, fontSize:13, marginBottom:10 }}>
                    <strong>Department:</strong> {selected.department}
                  </div>
                )}

                {/* Timeline */}
                {selected.history?.length > 0 && (
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#6B7280', marginBottom:6 }}>TIMELINE</div>
                    {selected.history.map((h,i) => (
                      <div key={i} style={{ display:'flex', gap:8, fontSize:12, color:'#374151', marginBottom:5 }}>
                        <span style={{ color:'#9CA3AF', whiteSpace:'nowrap' }}>{new Date(h.created_at).toLocaleDateString()}</span>
                        <span>{h.old_status||'—'} → <strong>{h.new_status}</strong></span>
                        {h.note && <span style={{ color:'#6B7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>· {h.note}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                {(canAssign || canReject) && (
                  <div style={{ borderTop:'1px solid #E5E7EB', paddingTop:12 }}>
                    <div style={{ display:'grid', gridTemplateColumns: canReject ? '1fr 1fr' : '1fr', gap:8, marginBottom:12 }}>
                      {canAssign && (
                        <button className="btn btn-primary" onClick={() => setActivePanel(activePanel === 'assign' ? null : 'assign')}>
                          📋 {selected.status === 'Assigned' ? 'Re-assign' : 'Assign'}
                        </button>
                      )}
                      {canReject && (
                        <button className="btn" style={{ color:'#DC2626', borderColor:'#DC2626' }}
                          onClick={() => setActivePanel(activePanel === 'reject' ? null : 'reject')}>
                          ✗ Reject
                        </button>
                      )}
                    </div>

                    {/* ── Assign form ── */}
                    {activePanel === 'assign' && (
                      <form onSubmit={handleAssign} style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:'#374151' }}>ASSIGN TO DEPARTMENT</div>

                        {deptLoading ? (
                          <div style={{ fontSize:13, color:'#9CA3AF', padding:'8px 12px', background:'#F3F4F6', borderRadius:8 }}>
                            ⏳ Loading departments...
                          </div>
                        ) : departments.length === 0 ? (
                          <div style={{ fontSize:13, color:'#DC2626', padding:'8px 12px', background:'#FEE2E2', borderRadius:8 }}>
                            ⚠️ No departments found. Ask SuperAdmin to create departments first.
                          </div>
                        ) : (
                          <select className="form-input" value={assignDeptId}
                            onChange={e => handleDeptChange(e.target.value)}>
                            <option value="">— Select Department * —</option>
                            {departments.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        )}

                        {assignDeptId && (
                          officersLoading ? (
                            <div style={{ fontSize:13, color:'#9CA3AF' }}>Loading officers...</div>
                          ) : (
                            <select className="form-input" value={assignOfficer}
                              onChange={e => setAssignOfficer(e.target.value)}>
                              <option value="">— Assign Specific Officer (optional) —</option>
                              {officers.length === 0
                                ? <option disabled>No officers in this department yet</option>
                                : officers.map(o => <option key={o.id} value={o.id}>{o.full_name} ({o.email})</option>)
                              }
                            </select>
                          )
                        )}

                        <textarea className="form-input"
                          placeholder="Note to officer / department (optional)..."
                          value={adminNote}
                          onChange={e => setAdminNote(e.target.value)}
                          rows={2} />

                        <div style={{ display:'flex', gap:8 }}>
                          <button className="btn btn-primary" type="submit" disabled={assigning || departments.length === 0}>
                            {assigning ? 'Assigning...' : '✅ Confirm Assign'}
                          </button>
                          <button className="btn" type="button" onClick={() => setActivePanel(null)}>Cancel</button>
                        </div>
                      </form>
                    )}

                    {/* ── Reject form ── */}
                    {activePanel === 'reject' && (
                      <form onSubmit={handleReject} style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:'#DC2626' }}>REJECT COMPLAINT</div>
                        <textarea className="form-input"
                          placeholder="Reason for rejection (optional)..."
                          value={rejectNote}
                          onChange={e => setRejectNote(e.target.value)}
                          rows={2} />
                        <div style={{ display:'flex', gap:8 }}>
                          <button className="btn" style={{ color:'#DC2626', borderColor:'#DC2626' }}
                            type="submit" disabled={rejecting}>
                            {rejecting ? 'Rejecting...' : '✗ Confirm Reject'}
                          </button>
                          <button className="btn" type="button" onClick={() => setActivePanel(null)}>Cancel</button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {!canAssign && !canReject && (
                  <div style={{ padding:'8px 12px', background:'#F3F4F6', borderRadius:8, fontSize:13, color:'#6B7280', textAlign:'center' }}>
                    Status: <strong>{selected.status}</strong>
                    {selected.status === 'Assigned' && (
                      <div style={{ marginTop:4, fontSize:12 }}>
                        <button className="btn btn-primary" style={{ fontSize:12, padding:'4px 12px' }}
                          onClick={() => setActivePanel('assign')}>
                          🔄 Re-assign to different department
                        </button>
                      </div>
                    )}
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
