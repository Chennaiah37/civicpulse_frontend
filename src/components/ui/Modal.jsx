export function Modal({ title, onClose, children, footer, maxWidth = 560 }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && (
          <div className="modal-footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 20, borderTop: '1px solid var(--border)', marginTop: 20 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
