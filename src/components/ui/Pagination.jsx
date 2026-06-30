export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1)
  return (
    <div className="pagination">
      <button className="page-btn" disabled={page === 1} onClick={() => onPageChange(page - 1)}>←</button>
      {pages.map((p) => (
        <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => onPageChange(p)}>
          {p}
        </button>
      ))}
      {totalPages > 7 && <span style={{ color: '#9CA3AF', fontSize: 13 }}>…</span>}
      <button className="page-btn" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>→</button>
    </div>
  )
}
