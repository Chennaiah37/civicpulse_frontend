import client from './client'

export const departmentsApi = {
  getAll:  ()           => client.get('/departments/'),
  create:  (payload)    => client.post('/departments/', payload),
  update:  (id, payload)=> client.patch(`/departments/${id}`, payload),
  remove:  (id)         => client.delete(`/departments/${id}`),
}
