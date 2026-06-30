import { useState, useCallback } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration)
  }, [])

  const success = useCallback((msg) => toast(msg, 'success'), [toast])
  const error   = useCallback((msg) => toast(msg, 'error'),   [toast])
  const info    = useCallback((msg) => toast(msg, 'info'),    [toast])

  return { toasts, toast, success, error, info }
}
