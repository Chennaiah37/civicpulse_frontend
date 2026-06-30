import { useState, useRef, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { complaintsApi } from '../../api/complaints'

// Reverse geocode using OpenStreetMap Nominatim (free, no API key)
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    const a = data.address || {}
    return {
      address: data.display_name || '',
      city:    a.city || a.town || a.village || a.county || '',
      ward:    a.suburb || a.neighbourhood || a.quarter || '',
    }
  } catch {
    return { address: '', city: '', ward: '' }
  }
}

export default function SubmitComplaintModal({ onClose, onSuccess, toast }) {
  const [form, setForm] = useState({
    title: '', description: '', address: '', city: '', ward: '',
    latitude: null, longitude: null,
  })
  const [image,      setImage]      = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [drag,       setDrag]       = useState(false)
  const [locStatus,  setLocStatus]  = useState('idle')  // idle | loading | success | error | denied
  const [mapPreview, setMapPreview] = useState(null)
  const fileRef = useRef()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  // Auto-detect location on mount — use a separate notifier so it never
  // interferes with the form or triggers onSuccess/onClose
  useEffect(() => { detectLocation() }, [])

  async function detectLocation() {
    if (!navigator.geolocation) {
      setLocStatus('error')
      return
    }
    setLocStatus('loading')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6))
        const lng = parseFloat(pos.coords.longitude.toFixed(6))

        setMapPreview({ lat, lng })
        setLocStatus('success')

        // Reverse geocode silently in background — no toast here
        const geo = await reverseGeocode(lat, lng)
        setForm(f => ({
          ...f,
          latitude:  lat,
          longitude: lng,
          address:   geo.address || f.address,
          city:      geo.city    || f.city,
          ward:      geo.ward    || f.ward,
        }))
      },
      (err) => {
        setLocStatus(err.code === 1 ? 'denied' : 'error')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  function handleFile(file) {
    if (file?.type.startsWith('image/')) setImage(file)
  }

  async function submit() {
    if (!form.title.trim() || form.title.trim().length < 5) {
      toast?.('Title must be at least 5 characters', 'error'); return
    }
    if (!form.description.trim() || form.description.trim().length < 10) {
      toast?.('Description must be at least 10 characters', 'error'); return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title',       form.title.trim())
      fd.append('description', form.description.trim())
      if (form.address)        fd.append('address',   form.address)
      if (form.city)           fd.append('city',      form.city)
      if (form.ward)           fd.append('ward',      form.ward)
      if (form.latitude  !== null) fd.append('latitude',  form.latitude)
      if (form.longitude !== null) fd.append('longitude', form.longitude)
      if (image) fd.append('image', image)

      const data = await complaintsApi.create(fd)
      toast?.(`✅ Submitted! Category: ${data.category} · Priority: ${data.priority}`, 'success')
      onSuccess?.(data)
      onClose()
    } catch (e) {
      toast?.(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const osmUrl = mapPreview
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${mapPreview.lng-0.005},${mapPreview.lat-0.005},${mapPreview.lng+0.005},${mapPreview.lat+0.005}&layer=mapnik&marker=${mapPreview.lat},${mapPreview.lng}`
    : null

  return (
    <Modal
      title="📢 Submit a Complaint"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Complaint'}
          </button>
        </>
      }
    >
      {/* ── Location Section ──────────────────────────── */}
      <div className="form-group">
        <label className="form-label">📍 Your Location</label>

        {/* Status bar — purely informational, no interaction with form state */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 10, marginBottom: 10,
          background: locStatus === 'success' ? '#D1FAE5'
                    : locStatus === 'loading' ? '#EEF2FF'
                    : locStatus === 'denied'  ? '#FEE2E2'
                    : '#F3F4F6',
          border: `1px solid ${
            locStatus === 'success' ? '#6EE7B7'
          : locStatus === 'loading' ? '#A5B4FC'
          : locStatus === 'denied'  ? '#FCA5A5'
          : '#E5E7EB'}`
        }}>
          <span style={{ fontSize: 20 }}>
            {locStatus === 'success' ? '✅'
           : locStatus === 'loading' ? '⏳'
           : locStatus === 'denied'  ? '🚫'
           : '📍'}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1E1B4B' }}>
              {locStatus === 'success' ? '📍 Location detected — address filled below'
             : locStatus === 'loading' ? 'Detecting your location…'
             : locStatus === 'denied'  ? 'Location access denied — enter address manually'
             : 'Location not set'}
            </div>
            {form.latitude && (
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
              </div>
            )}
          </div>
          {locStatus !== 'loading' && (
            <button
              type="button"
              className="btn"
              style={{ fontSize: 12, padding: '4px 12px' }}
              onClick={detectLocation}
            >
              {locStatus === 'success' ? '🔄 Re-detect' : '📍 Detect'}
            </button>
          )}
        </div>

        {/* Map preview */}
        {osmUrl && (
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #E2E8FF', marginBottom: 10, height: 150 }}>
            <iframe
              src={osmUrl}
              width="100%"
              height="150"
              style={{ border: 'none', display: 'block' }}
              title="Your location on map"
            />
          </div>
        )}

        {locStatus === 'denied' && (
          <div style={{ fontSize: 12, color: '#DC2626', background: '#FEE2E2', padding: '8px 12px', borderRadius: 8, marginBottom: 8 }}>
            Allow location access in your browser settings, or fill in the address fields below manually.
          </div>
        )}
      </div>

      {/* ── Title ─────────────────────────────────────── */}
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input
          className="form-input"
          placeholder="Brief issue title (e.g. Broken streetlight on Main Road)…"
          value={form.title}
          onChange={set('title')}
        />
      </div>

      {/* ── Description ───────────────────────────────── */}
      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea
          className="form-input form-textarea"
          placeholder="Describe the issue in detail — when did it start, how severe is it, who is affected…"
          value={form.description}
          onChange={set('description')}
        />
      </div>

      {/* ── Address (auto-filled, editable) ───────────── */}
      <div className="form-group">
        <label className="form-label">
          Address <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(auto-filled · editable)</span>
        </label>
        <input className="form-input" placeholder="Street address…" value={form.address} onChange={set('address')} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">City</label>
          <input className="form-input" placeholder="Hyderabad" value={form.city} onChange={set('city')} />
        </div>
        <div className="form-group">
          <label className="form-label">Ward / Area</label>
          <input className="form-input" placeholder="Ward 42 / Kondapur" value={form.ward} onChange={set('ward')} />
        </div>
      </div>

      {/* ── Image Upload ──────────────────────────────── */}
      <div className="form-group">
        <label className="form-label">Image (optional)</label>
        <div
          className={`upload-zone ${drag ? 'drag' : ''}`}
          onClick={() => fileRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
        >
          {image
            ? <><div className="upload-icon">🖼️</div><div className="upload-text">{image.name}</div></>
            : <><div className="upload-icon">📁</div><div className="upload-text">Drop image or click to upload</div></>
          }
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
          onChange={(e) => handleFile(e.target.files[0])} />
      </div>

      {/* ── ML note ───────────────────────────────────── */}
      <div className="ml-result-box">
        <div className="ml-tag">🤖 AI Auto-Classification</div>
        <div style={{ fontSize: 12, color: '#8B91A8' }}>
          Category and priority are predicted automatically upon submission.
        </div>
      </div>
    </Modal>
  )
}
