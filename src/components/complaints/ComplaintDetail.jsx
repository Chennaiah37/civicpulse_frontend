import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { StatusBadge, PriorityBadge } from '../ui/Badge'
import { timeAgo, imageUrl } from '../ui/helpers'
import { complaintsApi } from '../../api/complaints'
import { CATEGORY_ICONS, palette } from '../../styles/tokens'

export default function ComplaintDetail({ complaint, onClose, isAdmin, onUpdate, toast }) {
  const [status, setStatus] = useState(complaint.status)
  const [dept,   setDept]   = useState(complaint.department || '')
  const [saving, setSaving] = useState(false)

  async function handleUpdateStatus() {
    setSaving(true)
    try {
      // Reject uses /review; any other status change goes through /review too
      // (Assignment with department happens via handleAssignDept below)
      const updated = await complaintsApi.review(complaint.id, {
        status,
        admin_note: undefined,
      })
      toast?.('Status updated', 'success')
      onUpdate?.(updated)
      onClose()
    } catch (e) {
      toast?.(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleAssignDept() {
    if (!dept.trim()) { toast?.('Enter a department name', 'error'); return }
    setSaving(true)
    try {
      const updated = await complaintsApi.assign(complaint.id, {
        department: dept.trim(),
      })
      toast?.('Department assigned', 'success')
      onUpdate?.(updated)
    } catch (e) {
      toast?.(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const imgSrc = imageUrl(complaint.image_path)

  return (
    <Modal
      title={`${CATEGORY_ICONS[complaint.category] || '📋'} Complaint #${complaint.id}`}
      onClose={onClose}
      maxWidth={620}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          {isAdmin && (
            <button
              className="btn btn-primary"
              onClick={handleUpdateStatus}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Update Status'}
            </button>
          )}
        </>
      }
    >
      {/* Title & description */}
      <h3 style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>
        {complaint.title}
      </h3>
      <p style={{ fontSize: 13, color: "#6366F1", marginBottom: 16, lineHeight: 1.6 }}>
        {complaint.description}
      </p>

      {/* Badges */}
      <div className="complaint-badges" style={{ marginBottom: 20 }}>
        <StatusBadge   status={complaint.status}   />
        <PriorityBadge priority={complaint.priority} />
        {complaint.category && (
          <span className="badge" style={{ background: "#EEF2FF", color: "#4F46E5" }}>
            {complaint.category}
          </span>
        )}
      </div>

      {/* Image */}
      {imgSrc && (
        <div style={{ marginBottom: 16 }}>
          <div className="detail-label">Attached Image</div>
          <img
            src={imgSrc}
            alt="Complaint"
            className="img-preview"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>
      )}

      {/* Detail grid */}
      <div className="detail-grid" style={{ marginBottom: 20 }}>
        <div>
          <div className="detail-label">Location</div>
          <div className="detail-value">
            {complaint.city || '—'} {complaint.ward ? `· ${complaint.ward}` : ''}
          </div>
          {complaint.address && (
            <div style={{ fontSize: 12, color: "#A5B4FC", marginTop: 2 }}>
              {complaint.address}
            </div>
          )}
        </div>
        <div>
          <div className="detail-label">Department</div>
          <div className="detail-value">{complaint.department || 'Not assigned'}</div>
        </div>
        <div>
          <div className="detail-label">Submitted</div>
          <div className="detail-value">{timeAgo(complaint.created_at)}</div>
        </div>
        {complaint.resolved_at && (
          <div>
            <div className="detail-label">Resolved</div>
            <div className="detail-value">{timeAgo(complaint.resolved_at)}</div>
          </div>
        )}
      </div>

      {/* ML confidence */}
      {complaint.ml_confidence != null && (
        <div style={{ marginBottom: 16 }}>
          <div className="detail-label">ML Confidence</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="conf-bar" style={{ flex: 1 }}>
              <div
                className="conf-fill"
                style={{ width: `${Math.round(complaint.ml_confidence * 100)}%` }}
              />
            </div>
            <span style={{ fontSize: 13, color: "#6366F1", fontFamily: "'JetBrains Mono', monospace" }}>
              {Math.round(complaint.ml_confidence * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Image analysis */}
      {complaint.image_analysis_result && (
        <div className="ml-result-box" style={{ marginBottom: 16 }}>
          <div className="ml-tag">🤖 Image Analysis</div>
          <div style={{ fontSize: 12, color: "#6366F1" }}>
            {complaint.image_analysis_result}
          </div>
        </div>
      )}

      {/* Admin controls */}
      {isAdmin && (
        <>
          <div style={{ height: 1, background: palette.border, margin: '16px 0' }} />
          <div className="form-group">
            <label className="form-label">Update Status</label>
            <select
              className="form-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {['Pending', 'Assigned', 'Rejected'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                className="form-input"
                placeholder="e.g. Public Works"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 16 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleAssignDept}
                disabled={saving}
              >
                Assign
              </button>
            </div>
          </div>
        </>
      )}
    </Modal>
  )
}
