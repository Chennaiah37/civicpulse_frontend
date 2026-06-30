import { useState, useEffect } from 'react'
import { adminApi } from '../../api/admin'
import { authApi } from '../../api/auth'
import { departmentsApi } from '../../api/departments'
import { ROLE_META } from '../../styles/tokens'
import useAuthStore from '../../store/useAuthStore'

const ROLES = ['citizen', 'admin', 'department_officer', 'superadmin']

const EMPTY_CREATE = { full_name:'', email:'', phone:'', password:'', role:'admin', department_id:'' }

export default function UserManagement({ toast }) {
  const { user: me } = useAuthStore()
  const [users,        setUsers]        = useState([])
  const [departments,  setDepartments]  = useState([])
  const [loading,      setLoading]      = useState(true)
  const [filterRole,   setFilterRole]   = useState('')

  // Edit role modal
  const [editUser,   setEditUser]   = useState(null)
  const [newRole,    setNewRole]    = useState('')
  const [newDeptId,  setNewDeptId]  = useState('')
  const [saving,     setSaving]     = useState(false)

  // Create user modal
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState(EMPTY_CREATE)
  const [creating,   setCreating]   = useState(false)

  const isSuperAdmin = me?.role === 'superadmin'

  useEffect(() => { fetchAll() }, [filterRole])

  useEffect(() => {
    departmentsApi.getAll()
      .then(setDepartments)
      .catch(() => {})
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const params = filterRole ? { role: filterRole } : {}
      setUsers(await adminApi.getUsers(params))
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  function openEdit(user) {
    setEditUser(user)
    setNewRole(user.role)
    setNewDeptId(user.department_id || '')
  }

  async function handleRoleUpdate(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await adminApi.updateRole(editUser.id, {
        role: newRole,
        department_id: newDeptId ? parseInt(newDeptId) : null,
      })
      toast(`${editUser.full_name}'s role updated to ${newRole}`, 'success')
      setEditUser(null)
      fetchAll()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(user) {
    try {
      await adminApi.toggleActive(user.id)
      toast(`${user.full_name} ${user.is_active ? 'deactivated' : 'activated'}`, 'success')
      fetchAll()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function handleDelete(user) {
    if (!confirm(`Delete ${user.full_name}? This cannot be undone.`)) return
    try {
      await adminApi.deleteUser(user.id)
      toast('User deleted', 'success')
      fetchAll()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault()
    if (!createForm.full_name.trim()) { toast('Full name required', 'error'); return }
    if (!createForm.email.trim())     { toast('Email required', 'error'); return }
    if (!createForm.password)         { toast('Password required', 'error'); return }
    setCreating(true)
    try {
      const payload = {
        full_name:     createForm.full_name.trim(),
        email:         createForm.email.trim(),
        phone:         createForm.phone || undefined,
        password:      createForm.password,
        role:          createForm.role,
        department_id: createForm.department_id ? parseInt(createForm.department_id) : null,
      }
      await authApi.createUser(payload)
      toast(`✅ ${createForm.role} account created for ${createForm.full_name}`, 'success')
      setShowCreate(false)
      setCreateForm(EMPTY_CREATE)
      fetchAll()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <div className="topbar">
        <span className="page-title">👥 User Management</span>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <span style={{ color:'#9CA3AF', fontSize:13 }}>{users.length} users</span>
          {isSuperAdmin && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              + Create User
            </button>
          )}
        </div>
      </div>

      <div className="content">
        <div className="page-banner" style={{ marginBottom:24, background:'linear-gradient(135deg,#7C3AED,#6D28D9)' }}>
          <div className="page-banner-overlay" style={{ background:'linear-gradient(135deg,rgba(124,58,237,0.85),rgba(109,40,217,0.7))' }} />
          <div className="page-banner-content">
            <div className="page-banner-title">👥 User & Role Management</div>
            <div className="page-banner-sub">Create admins, officers and manage all user roles</div>
          </div>
        </div>

        {/* Role filter */}
        <div className="card" style={{ marginBottom:16 }}>
          <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
            {['', 'citizen', 'admin', 'department_officer', 'superadmin'].map(r => (
              <button key={r} className="btn"
                style={{ background:filterRole===r?'#4F46E5':'', color:filterRole===r?'#fff':'', borderColor:filterRole===r?'#4F46E5':'', fontSize:13 }}
                onClick={() => setFilterRole(r)}>
                {r ? (ROLE_META[r]?.icon + ' ' + ROLE_META[r]?.label) : 'All Roles'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Create User Modal ── */}
        {showCreate && isSuperAdmin && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:480 }}>
              <div className="modal-header">
                <h2>➕ Create New User</h2>
                <button className="modal-close" onClick={() => setShowCreate(false)}>×</button>
              </div>
              <form onSubmit={handleCreateUser} style={{ padding:20, display:'flex', flexDirection:'column', gap:14 }}>

                {/* Role picker at top so department field shows/hides correctly */}
                <div>
                  <label className="form-label">Role *</label>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {ROLES.map(r => {
                      const rm = ROLE_META[r] || {}
                      const active = createForm.role === r
                      return (
                        <button key={r} type="button"
                          onClick={() => setCreateForm(f => ({ ...f, role:r, department_id:'' }))}
                          style={{
                            padding:'10px 14px', borderRadius:10, border:`2px solid ${active ? '#4F46E5' : '#E5E7EB'}`,
                            background: active ? '#EEF2FF' : '#fff', cursor:'pointer',
                            display:'flex', alignItems:'center', gap:8,
                            fontWeight: active ? 700 : 400, fontSize:13, color: active ? '#4F46E5' : '#374151',
                          }}>
                          <span style={{ fontSize:18 }}>{rm.icon}</span>
                          <div style={{ textAlign:'left' }}>
                            <div>{rm.label}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div style={{ gridColumn:'span 2' }}>
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" placeholder="e.g. Ravi Kumar" required
                      value={createForm.full_name}
                      onChange={e => setCreateForm(f => ({ ...f, full_name:e.target.value }))} />
                  </div>
                  <div style={{ gridColumn:'span 2' }}>
                    <label className="form-label">Email *</label>
                    <input className="form-input" type="email" placeholder="ravi@civicpulse.gov" required
                      value={createForm.email}
                      onChange={e => setCreateForm(f => ({ ...f, email:e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input className="form-input" placeholder="+91 9999999999"
                      value={createForm.phone}
                      onChange={e => setCreateForm(f => ({ ...f, phone:e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label">Password *</label>
                    <input className="form-input" type="password" placeholder="Min 6 chars" required
                      value={createForm.password}
                      onChange={e => setCreateForm(f => ({ ...f, password:e.target.value }))} />
                  </div>
                </div>

                {/* Department — only for officers */}
                {createForm.role === 'department_officer' && (
                  <div>
                    <label className="form-label">Department</label>
                    {departments.length === 0 ? (
                      <div style={{ fontSize:13, color:'#DC2626', padding:'8px 12px', background:'#FEE2E2', borderRadius:8 }}>
                        ⚠️ No departments yet. Create one first in Department Management.
                      </div>
                    ) : (
                      <select className="form-input" value={createForm.department_id}
                        onChange={e => setCreateForm(f => ({ ...f, department_id:e.target.value }))}>
                        <option value="">— Assign to department (optional) —</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    )}
                  </div>
                )}

                <div style={{ padding:'10px 14px', background:'#F3F4F6', borderRadius:8, fontSize:12, color:'#6B7280' }}>
                  ℹ️ The user can log in immediately with these credentials. Share them securely.
                </div>

                <div style={{ display:'flex', gap:10 }}>
                  <button className="btn btn-primary" type="submit" disabled={creating} style={{ flex:1 }}>
                    {creating ? 'Creating...' : `✅ Create ${ROLE_META[createForm.role]?.label}`}
                  </button>
                  <button className="btn" type="button" onClick={() => setShowCreate(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Edit Role Modal ── */}
        {editUser && isSuperAdmin && (
          <div className="modal-overlay" onClick={() => setEditUser(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Role — {editUser.full_name}</h2>
                <button className="modal-close" onClick={() => setEditUser(null)}>×</button>
              </div>
              <form onSubmit={handleRoleUpdate} style={{ padding:20, display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label className="form-label">Role</label>
                  <select className="form-input" value={newRole} onChange={e => setNewRole(e.target.value)}>
                    {ROLES.map(r => <option key={r} value={r}>{ROLE_META[r]?.icon} {ROLE_META[r]?.label}</option>)}
                  </select>
                </div>
                {newRole === 'department_officer' && (
                  <div>
                    <label className="form-label">Assign to Department</label>
                    <select className="form-input" value={newDeptId} onChange={e => setNewDeptId(e.target.value)}>
                      <option value="">No department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                )}
                <div style={{ display:'flex', gap:10 }}>
                  <button className="btn btn-primary" type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Update Role'}
                  </button>
                  <button className="btn" type="button" onClick={() => setEditUser(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── User Table ── */}
        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'#9CA3AF' }}>Loading users...</div>
        ) : (
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th>
                  {isSuperAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={isSuperAdmin ? 7 : 6} style={{ textAlign:'center', padding:32, color:'#9CA3AF' }}>
                    No users found
                  </td></tr>
                ) : users.map(u => {
                  const rm   = ROLE_META[u.role] || {}
                  const dept = departments.find(d => d.id === u.department_id)
                  return (
                    <tr key={u.id}>
                      <td style={{ fontFamily:'monospace', fontSize:12, color:'#9CA3AF' }}>{u.id}</td>
                      <td style={{ fontWeight:500 }}>{u.full_name}</td>
                      <td style={{ fontSize:13, color:'#6B7280' }}>{u.email}</td>
                      <td>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, background:rm.bg, color:rm.color, fontSize:12, fontWeight:600 }}>
                          {rm.icon} {rm.label}
                        </span>
                      </td>
                      <td style={{ fontSize:13 }}>{dept?.name || '—'}</td>
                      <td>
                        <span style={{ padding:'3px 10px', borderRadius:20, background:u.is_active?'#D1FAE5':'#FEE2E2', color:u.is_active?'#059669':'#DC2626', fontSize:12, fontWeight:600 }}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {isSuperAdmin && (
                        <td>
                          {u.id !== me.id ? (
                            <div style={{ display:'flex', gap:6 }}>
                              <button className="btn" style={{ padding:'3px 10px', fontSize:12 }} onClick={() => openEdit(u)}>
                                Edit Role
                              </button>
                              <button className="btn" style={{ padding:'3px 10px', fontSize:12, color:u.is_active?'#D97706':'#059669' }} onClick={() => handleToggle(u)}>
                                {u.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button className="btn" style={{ padding:'3px 10px', fontSize:12, color:'#DC2626', borderColor:'#DC2626' }} onClick={() => handleDelete(u)}>
                                Delete
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize:12, color:'#9CA3AF' }}>You</span>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
