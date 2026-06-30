import client from './client'

export const analyticsApi = {
  summary:      () => client.get('/analytics/summary'),
  byCategory:   () => client.get('/analytics/by-category'),
  byPriority:   () => client.get('/analytics/by-priority'),
  byCity:       () => client.get('/analytics/by-city'),
  byWard:       () => client.get('/analytics/by-ward'),
  byDepartment: () => client.get('/analytics/by-department'),
  monthlyTrend: () => client.get('/analytics/monthly-trend'),
}
