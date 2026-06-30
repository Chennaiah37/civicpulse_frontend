import client from './client'

export const adminApi = {
  getUsers:       (params = {}) => client.get('/admin/users', { params }),
  getOfficers:    (params = {}) => client.get('/admin/officers', { params }),
  updateRole:     (id, payload) => client.patch(`/admin/users/${id}/role`, payload),
  toggleActive:   (id)          => client.patch(`/admin/users/${id}/toggle-active`),
  deleteUser:     (id)          => client.delete(`/admin/users/${id}`),
}
