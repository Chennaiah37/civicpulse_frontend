import { useState, useEffect, useCallback } from 'react'
import { complaintsApi } from '../api/complaints'

export function useComplaints({ mine = false, assigned = false, pageSize = 10 } = {}) {
  const [items,      setItems]      = useState([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page,       setPage]       = useState(1)
  const [filters,    setFilters]    = useState({})
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, page_size: pageSize, ...filters }
      let data
      if (mine)          data = await complaintsApi.getMine(params)
      else if (assigned) data = await complaintsApi.getAssigned(params)
      else               data = await complaintsApi.getAll(params)

      setItems(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(Math.ceil((data.total || 0) / pageSize) || 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [mine, assigned, page, pageSize, JSON.stringify(filters)])

  useEffect(() => { fetch() }, [fetch])

  function updateItem(updated) {
    setItems(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  function prependItem(newItem) {
    setItems(prev => [newItem, ...prev])
    setTotal(t => t + 1)
  }

  return { items, total, totalPages, page, setPage, setFilters, loading, error, updateItem, prependItem, refetch: fetch }
}
