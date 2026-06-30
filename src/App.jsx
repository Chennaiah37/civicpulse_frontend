import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/useAuthStore'
import { useToast } from './hooks/useToast'
import { ToastContainer } from './components/ui/Toast'
import { ProtectedRoute } from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

// Pages
import AuthPage           from './pages/auth/AuthPage'
import Dashboard          from './pages/citizen/Dashboard'
import MyComplaints       from './pages/citizen/MyComplaints'
import NotificationsPage  from './pages/citizen/Notifications'
import Profile            from './pages/citizen/Profile'
import AllComplaints      from './pages/admin/AllComplaints'
import Analytics          from './pages/admin/Analytics'
import UserManagement     from './pages/admin/UserManagement'
import AssignedComplaints from './pages/officer/AssignedComplaints'
import DepartmentManagement from './pages/superadmin/Departments'

export default function App() {
  const { hydrate, user } = useAuthStore()
  const { toasts, error, success } = useToast()

  useEffect(() => { hydrate() }, [hydrate])

  const toast = (msg, type = 'success') => type === 'error' ? error(msg) : success(msg)

  // Determine default redirect after login based on role
  function DefaultRedirect() {
    const role = user?.role
    if (role === 'admin' || role === 'superadmin') return <Navigate to="/admin/complaints" replace />
    if (role === 'department_officer')             return <Navigate to="/officer/complaints" replace />
    return <Dashboard toast={toast} />
  }

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<AuthPage />} />

        {/* Authenticated shell */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>

          {/* Root — redirects per role */}
          <Route index element={<DefaultRedirect />} />

          {/* ── CITIZEN ───────────────────────────────────────── */}
          <Route path="complaints"    element={<ProtectedRoute><MyComplaints toast={toast} /></ProtectedRoute>} />
          <Route path="notifications" element={<ProtectedRoute><NotificationsPage toast={toast} /></ProtectedRoute>} />
          <Route path="profile"       element={<ProtectedRoute><Profile toast={toast} /></ProtectedRoute>} />

          {/* ── ADMIN ─────────────────────────────────────────── */}
          <Route path="admin/complaints" element={<ProtectedRoute adminOnly><AllComplaints toast={toast} /></ProtectedRoute>} />
          <Route path="admin/analytics"  element={<ProtectedRoute adminOnly><Analytics toast={toast} /></ProtectedRoute>} />
          <Route path="admin/users"      element={<ProtectedRoute adminOnly><UserManagement toast={toast} /></ProtectedRoute>} />

          {/* ── SUPERADMIN ────────────────────────────────────── */}
          <Route path="admin/departments" element={<ProtectedRoute superAdminOnly><DepartmentManagement toast={toast} /></ProtectedRoute>} />

          {/* ── DEPARTMENT OFFICER ────────────────────────────── */}
          <Route path="officer/complaints" element={<ProtectedRoute officerOnly><AssignedComplaints toast={toast} /></ProtectedRoute>} />

        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer toasts={toasts} />
    </>
  )
}
