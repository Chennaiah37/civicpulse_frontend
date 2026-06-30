import { useState, useEffect } from 'react'
import { departmentsApi } from '../../api/departments'
import { adminApi } from '../../api/admin'

export default function DepartmentManagement({ toast }) {
  const [departments,  setDepartments]  = useState([])
  const [allOfficers,  setAllOfficers]  = useState([])  // all dept_officers (any dept or none)
  const [allUsers,     setAllUsers]     = useState([])  // all users — to promote citizens to officer
  const [loading,      setLoading]      = useState(true)
  const [showForm,     setShowForm]     = useState(false)
  const [editDept,     setEditDept]     = useState(null)
  const [saving,       setSaving]       = useState(false)
  const [form, setForm] = useState({ name:'', description:'', head_name:'', email:'', phone:'' })

  // Assign officer modal
  const [assignTarget, setAssignTarget] = useState(null)  // dept being assigned to
  const [assignUserId, setAssignUserId] = useState('')
  const [assigning,    setAssigning]    = useState(false)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [d, o, u] = await Promise.all([
        departmentsApi.getAll(),
        adminApi.getOfficers(),
        adminApi.getUsers({ page_size: 100 }),
      ])
      setDepartments(d)
      setAllOfficers(o)
      setAllUsers(u)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditDept(null)
    setForm({ name:'', description:'', head_name:'', email:'', phone:'' })
    setShowForm(true)
  }
  function openEdit(d) {
    setEditDept(d)
    setForm({ name:d.name, description:d.description||'', head_name:d.head_name||'', email:d.email||'', phone:d.phone||'' })
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editDept) {
        await departmentsApi.update(editDept.id, form)
        toast('Department updated', 'success')
      } else {
        await departmentsApi.create(form)
        toast('Department created', 'success')
      }
      setShowForm(false)
      fetchAll()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(dept) {
    if (!confirm(`Delete "${dept.name}"? Officers assigned to it will be unlinked.`)) return
    try {
      await departmentsApi.remove(dept.id)
      toast('Department deleted', 'success')
      fetchAll()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  function openAssign(dept) {
    setAssignTarget(dept)
    setAssignUserId('')
  }

  async function handleAssignOfficer(e) {
    e.preventDefault()
    if (!assignUserId) { toast('Select a user to assign', 'error'); return }
    setAssigning(true)
    try {
      const user = allUsers.find(u => u.id === parseInt(assignUserId))
      // Promote to department_officer and link to this dept
      await adminApi.updateRole(parseInt(assignUserId), {
        role: 'department_officer',
        department_id: assignTarget.id,
      })
      toast(`${user?.full_name} assigned to ${assignTarget.name} as officer`, 'success')
      setAssignTarget(null)
      fetchAll()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setAssigning(false)
    }
  }

  async function handleRemoveOfficer(officer) {
    if (!confirm(`Remove ${officer.full_name} from their department?`)) return
    try {
      await adminApi.updateRole(officer.id, {
        role: 'department_officer',
        department_id: null,
      })
      toast(`${officer.full_name} removed from department`, 'success')
      fetchAll()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  // Group officers by their assigned dept
  const officersByDept = {}
  allOfficers.forEach(o => {
    const k = o.department_id || 'unassigned'
    if (!officersByDept[k]) officersByDept[k] = []
    officersByDept[k].push(o)
  })

  // Users available to assign: exclude superadmins and self
  // Show all non-superadmin users so you can promote a citizen to officer too
  const assignableUsers = allUsers.filter(u => u.role !== 'superadmin')

  return (
    <div>
      <div className="topbar">
        <span className="page-title">🏢 Department Management</span>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Department</button>
      </div>

      <div className="content">
        <div className="page-banner" style={{ marginBottom:24, background:'linear-gradient(135deg,#7C3AED,#A78BFA)' }}>
          <div className="page-banner-overlay" style={{ background:'linear-gradient(135deg,rgba(124,58,237,0.85),rgba(167,139,250,0.7))' }} />
          <div className="page-banner-content">
            <div className="page-banner-title">👑 Super Admin — Department Control</div>
            <div className="page-banner-sub">Create departments, assign officers, manage the entire system</div>
          </div>
        </div>

        {/* Department create/edit modal */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editDept ? 'Edit Department' : 'New Department'}</h2>
                <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
              </div>
              <form onSubmit={handleSave} style={{ padding:20, display:'flex', flexDirection:'column', gap:12 }}>
                <div>
                  <label className="form-label">Department Name *</label>
                  <input className="form-input" required value={form.name}
                    onChange={e => setForm({...form, name:e.target.value})} placeholder="e.g. Public Works" />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={2} value={form.description}
                    onChange={e => setForm({...form, description:e.target.value})}
                    placeholder="What this department handles..." />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label className="form-label">Head Name</label>
                    <input className="form-input" value={form.head_name}
                      onChange={e => setForm({...form, head_name:e.target.value})} placeholder="e.g. John Smith" />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone}
                      onChange={e => setForm({...form, phone:e.target.value})} placeholder="+91 9999999999" />
                  </div>
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email}
                    onChange={e => setForm({...form, email:e.target.value})} placeholder="dept@civicpulse.gov" />
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button className="btn btn-primary" type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Department'}
                  </button>
                  <button className="btn" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign officer modal */}
        {assignTarget && (
          <div className="modal-overlay" onClick={() => setAssignTarget(null)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:420 }}>
              <div className="modal-header">
                <h2>➕ Assign Officer — {assignTarget.name}</h2>
                <button className="modal-close" onClick={() => setAssignTarget(null)}>×</button>
              </div>
              <form onSubmit={handleAssignOfficer} style={{ padding:20, display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ fontSize:13, color:'#6B7280', background:'#F3F4F6', padding:'10px 14px', borderRadius:8 }}>
                  Select any user below. If they are not already a Department Officer, they will be promoted automatically.
                </div>
                <div>
                  <label className="form-label">Select User *</label>
                  <select className="form-input" value={assignUserId}
                    onChange={e => setAssignUserId(e.target.value)}>
                    <option value="">— Pick a user —</option>
                    {assignableUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.email}) · {u.role}
                        {u.department_id === assignTarget.id ? ' ✓ already here' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button className="btn btn-primary" type="submit" disabled={assigning}>
                    {assigning ? 'Assigning...' : '✅ Assign Officer'}
                  </button>
                  <button className="btn" type="button" onClick={() => setAssignTarget(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'#9CA3AF' }}>Loading departments...</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
            {departments.map(dept => {
              const deptOfficers = officersByDept[dept.id] || []
              return (
                <div key={dept.id} className="card">
                  {/* Dept header */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:16, color:'#1E1B4B' }}>🏢 {dept.name}</div>
                      {dept.description && <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>{dept.description}</div>}
                    </div>
                    <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                      <button className="btn" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => openEdit(dept)}>Edit</button>
                      <button className="btn" style={{ padding:'4px 10px', fontSize:12, color:'#DC2626', borderColor:'#DC2626' }} onClick={() => handleDelete(dept)}>Delete</button>
                    </div>
                  </div>

                  {/* Dept meta */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:12, fontSize:12 }}>
                    {dept.head_name && <div><span style={{ color:'#9CA3AF' }}>Head: </span>{dept.head_name}</div>}
                    {dept.phone     && <div><span style={{ color:'#9CA3AF' }}>Phone: </span>{dept.phone}</div>}
                    {dept.email     && <div style={{ gridColumn:'span 2' }}><span style={{ color:'#9CA3AF' }}>Email: </span>{dept.email}</div>}
                  </div>

                  {/* Officers section */}
                  <div style={{ borderTop:'1px solid #E5E7EB', paddingTop:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'#6B7280' }}>
                        OFFICERS ({deptOfficers.length})
                      </div>
                      <button
                        className="btn btn-primary"
                        style={{ padding:'3px 10px', fontSize:11 }}
                        onClick={() => openAssign(dept)}
                      >
                        + Assign Officer
                      </button>
                    </div>

                    {deptOfficers.length === 0 ? (
                      <div style={{ fontSize:12, color:'#9CA3AF', fontStyle:'italic' }}>
                        No officers assigned yet — click + Assign Officer
                      </div>
                    ) : deptOfficers.map(o => (
                      <div key={o.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, padding:'6px 8px', background:'#F9FAFB', borderRadius:8 }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#D97706', flexShrink:0 }}>
                          {o.full_name[0]}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.full_name}</div>
                          <div style={{ fontSize:11, color:'#9CA3AF', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.email}</div>
                        </div>
                        <button
                          onClick={() => handleRemoveOfficer(o)}
                          style={{ background:'none', border:'none', color:'#DC2626', cursor:'pointer', fontSize:14, padding:'0 4px', flexShrink:0 }}
                          title="Remove from department"
                        >×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {departments.length === 0 && (
              <div style={{ gridColumn:'span 3', textAlign:'center', padding:40, color:'#9CA3AF' }}>
                No departments yet. Click "+ Add Department" to create one.
              </div>
            )}
          </div>
        )}

        {/* Unassigned officers */}
        {(officersByDept['unassigned'] || []).length > 0 && (
          <div className="card" style={{ marginTop:24 }}>
            <div style={{ fontWeight:600, marginBottom:12, color:'#DC2626' }}>
              ⚠️ Unassigned Officers ({officersByDept['unassigned'].length})
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {officersByDept['unassigned'].map(o => (
                <div key={o.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', background:'#FEE2E2', borderRadius:20, fontSize:12 }}>
                  <span>🔧 {o.full_name}</span>
                  <span style={{ color:'#9CA3AF' }}>{o.email}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:8 }}>
              These officers have no department. Use "+ Assign Officer" on any department above to link them.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
