import { useState, useEffect, useCallback } from 'react'
import { notificationsApi } from '../api/notifications'

export function useNotifications({ unreadOnly = false } = {}) {
  const [notifs,  setNotifs]  = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const params = unreadOnly ? { unread_only: true } : {}
      const data = await notificationsApi.getAll(params)
      setNotifs(Array.isArray(data) ? data : [])
    } catch {
      setNotifs([])
    } finally {
      setLoading(false)
    }
  }, [unreadOnly])

  useEffect(() => { fetch() }, [fetch])

  const markRead = useCallback(async (id) => {
    await notificationsApi.markRead(id)
    setNotifs((n) => n.map((x) => (x.id === id ? { ...x, is_read: true } : x)))
  }, [])

  const markAllRead = useCallback(async () => {
    await notificationsApi.markAllRead()
    setNotifs((n) => n.map((x) => ({ ...x, is_read: true })))
  }, [])

  const unreadCount = notifs.filter((n) => !n.is_read).length

  return { notifs, loading, unreadCount, markRead, markAllRead, refresh: fetch }
}
