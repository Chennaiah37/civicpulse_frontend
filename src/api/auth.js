import client from './client'

export const authApi = {
  register:   (payload) => client.post('/auth/register', payload),
  login:      (payload) => client.post('/auth/login', payload),
  me:         ()        => client.get('/auth/me'),       // alias used by useAuthStore
  getMe:      ()        => client.get('/auth/me'),
  updateMe:   (payload) => client.patch('/auth/me', payload),
  createUser: (payload) => client.post('/auth/create-user', payload),
}
