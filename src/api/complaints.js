import client from './client'

export const complaintsApi = {
  // Citizen
  getMine:    (params = {}) => client.get('/complaints/my', { params }),
  create:     (formData)    => client.post('/complaints/', formData),
  getById:    (id)          => client.get(`/complaints/${id}`),

  // Admin
  getAll:     (params = {}) => client.get('/complaints/all', { params }),
  assign:     (id, payload) => client.patch(`/complaints/${id}/assign`, payload),
  review:     (id, payload) => client.patch(`/complaints/${id}/review`, payload),

  // Department Officer
  getAssigned:(params = {}) => client.get('/complaints/assigned', { params }),
  updateProgress: (id, payload) => client.patch(`/complaints/${id}/progress`, payload),
}
