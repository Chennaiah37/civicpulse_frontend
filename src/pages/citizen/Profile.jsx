import { useState } from 'react'
import useAuthStore from '../../store/useAuthStore'
import { getInitials } from '../../components/ui/helpers'
import { RoleBadge } from '../../components/ui/Badge'
import { timeAgo } from '../../components/ui/helpers'
import { palette } from '../../styles/tokens'

export default function Profile({ toast }) {
  const { user, updateUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form,    setForm]    = useState({
    full_name: user?.full_name || '',
    phone:     user?.phone     || '',
  })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function save() {
    if (!form.full_name.trim()) { toast?.('Name is required', 'error'); return }
    setLoading(true)
    try {
      // Optimistic local update — wire to PATCH /auth/me when backend supports it
      updateUser(form)
      toast?.('Profile updated', 'success')
      setEditing(false)
    } catch (e) {
      toast?.(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const initials = getInitials(user?.full_name)

  return (
    <div>
      <div className="topbar">
        <span className="page-title">My Profile</span>
      </div>

      <div className="content" style={{ maxWidth: 600 }}>
        {/* Main card */}
        <div className="card">
          <div className="profile-header">
            <div className="profile-avatar">{initials}</div>
            <div>
              <div className="profile-name">{user?.full_name}</div>
              <div className="profile-email">{user?.email}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                <RoleBadge role={user?.role} />
                {user?.is_active && (
                  <span className="badge" style={{ background: "#D1FAE5", color: "#059669" }}>
                    Active
                  </span>
                )}
              </div>
            </div>
            {!editing && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginLeft: 'auto' }}
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
            )}
          </div>

          <div style={{ height: 1, background: palette.border, marginBottom: 20 }} />

          {editing ? (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.full_name} onChange={set('full_name')} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={set('phone')}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={save} disabled={loading}>
                  {loading ? 'Saving…' : 'Save Changes'}
                </button>
                <button className="btn btn-ghost" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="detail-grid">
              <div>
                <div className="detail-label">Full Name</div>
                <div className="detail-value">{user?.full_name}</div>
              </div>
              <div>
                <div className="detail-label">Email</div>
                <div className="detail-value" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                  {user?.email}
                </div>
              </div>
              <div>
                <div className="detail-label">Phone</div>
                <div className="detail-value">{user?.phone || 'Not set'}</div>
              </div>
              <div>
                <div className="detail-label">Member Since</div>
                <div className="detail-value">{timeAgo(user?.created_at)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Account info card */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header">
            <span className="card-title">Account Info</span>
          </div>
          <div style={{ fontSize: 13, color: "#6366F1", lineHeight: 1.9 }}>
            <div>🔐 Password changes are handled via account security settings.</div>
            <div>📧 Email address cannot be changed once registered.</div>
            <div>
              🆔 User ID:{' '}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#A5B4FC" }}>
                #{user?.id}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
