// Derive the root server URL (for images/uploads) from the API URL.
// .env only defines VITE_API_URL (e.g. http://localhost:8000/api/v1)
// — strip the /api/v1 suffix to get the file-serving root.
const API_URL  = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const BASE_URL = API_URL.replace(/\/api\/v1\/?$/, '')

export function timeAgo(dt) {
  if (!dt) return '—'
  const diff = Date.now() - new Date(dt)
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

export function imageUrl(path) {
  if (!path) return null
  return `${BASE_URL}/${path.replace(/^\//, '')}`
}
