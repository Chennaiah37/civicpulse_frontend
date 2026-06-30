import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import { ADMIN_ROLES, OFFICER_ROLES } from '../styles/tokens'

export function ProtectedRoute({ children, adminOnly = false, officerOnly = false, superAdminOnly = false }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0D0F14' }}>
        <div className="spinner" style={{ width:32, height:32, borderWidth:3 }} />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (superAdminOnly && user.role !== 'superadmin')
    return <Navigate to="/" replace />

  if (adminOnly && !ADMIN_ROLES.includes(user.role))
    return <Navigate to="/" replace />

  if (officerOnly && !OFFICER_ROLES.includes(user.role) && !ADMIN_ROLES.includes(user.role))
    return <Navigate to="/" replace />

  return children
}
