import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

export default function AuthPage() {
  const [tab,      setTab]      = useState('login')
  const [form,     setForm]     = useState({ full_name:'', email:'', phone:'', password:'', confirm_password:'' })
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  const { login, register } = useAuthStore()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function switchTab(t) {
    setTab(t)
    setError('')
    setSuccess('')
    setForm({ full_name:'', email:'', phone:'', password:'', confirm_password:'' })
  }

  async function submit() {
    setError('')
    setSuccess('')

    if (!form.email.trim() || !form.password.trim()) {
      setError('Email and password are required')
      return
    }

    if (tab === 'register') {
      if (!form.full_name.trim()) { setError('Full name is required'); return }
      if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
      if (form.password !== form.confirm_password) { setError('Passwords do not match'); return }
    }

    setLoading(true)
    try {
      if (tab === 'login') {
        await login({ email: form.email.trim(), password: form.password })
        navigate('/')   // go to dashboard only on login
      } else {
        await register({
          full_name: form.full_name.trim(),
          email:     form.email.trim(),
          phone:     form.phone.trim() || undefined,
          password:  form.password,
        })
        // After register — show success and switch to login tab
        setSuccess('✅ Account created! Please sign in with your credentials.')
        setTab('login')
        setForm({ full_name:'', email: form.email.trim(), phone:'', password:'', confirm_password:'' })
      }
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function onKey(e) { if (e.key === 'Enter') submit() }

  const FEATURES = [
    { icon:'🤖', title:'AI-Powered Classification', desc:'Smart complaint routing using machine learning' },
    { icon:'📍', title:'Location-Based Tracking',   desc:'Monitor issues in your ward and city'          },
    { icon:'🔔', title:'Real-Time Updates',          desc:'Get notified on every status change instantly'  },
    { icon:'📊', title:'Analytics Dashboard',        desc:'Comprehensive insights for administrators'      },
  ]

  return (
    <div className="auth-screen">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-logo">Civic<span>Pulse</span></div>
        <div className="auth-left-tagline">
          AI-powered civic complaint management. Making cities better, one issue at a time.
        </div>
        <div className="auth-features">
          {FEATURES.map(f => (
            <div key={f.title} className="auth-feature">
              <div className="auth-feature-icon">{f.icon}</div>
              <div className="auth-feature-text">
                <strong>{f.title}</strong>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
        <div className="auth-floating-cards">
          <div className="auth-float-card">
            <div className="auth-float-card-label">Complaints Resolved</div>
            <div className="auth-float-card-value">2,847+</div>
          </div>
          <div className="auth-float-card">
            <div className="auth-float-card-label">Avg. Resolution Time</div>
            <div className="auth-float-card-value">3.2 days</div>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900&q=60&auto=format&fit=crop"
          alt=""
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.06, zIndex:0, pointerEvents:'none' }}
        />
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div style={{ marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:28 }}>👋</span>
        </div>
        <div className="auth-right-title">
          {tab === 'login' ? 'Welcome back!' : 'Create your account'}
        </div>
        <div className="auth-right-sub">
          {tab === 'login'
            ? 'Sign in to track and manage civic complaints'
            : 'Join thousands of citizens making a difference'}
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`}    onClick={() => switchTab('login')}>Sign In</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => switchTab('register')}>Register</button>
        </div>

        {/* Error */}
        {error && (
          <div className="auth-error" style={{ marginBottom:12 }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{ background:'#D1FAE5', border:'1px solid #6EE7B7', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#065F46', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
            {success}
          </div>
        )}

        {/* Register fields */}
        {tab === 'register' && (
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" placeholder="Rahul Sharma"
              value={form.full_name} onChange={set('full_name')} onKeyDown={onKey} />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input className="form-input" type="email" placeholder="citizen@example.com"
            value={form.email} onChange={set('email')} onKeyDown={onKey} />
        </div>

        {tab === 'register' && (
          <div className="form-group">
            <label className="form-label">Phone <span style={{ color:'#9CA3AF', fontWeight:400 }}>(optional)</span></label>
            <input className="form-input" placeholder="+91 98765 43210"
              value={form.phone} onChange={set('phone')} onKeyDown={onKey} />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Password *</label>
          <input className="form-input" type="password" placeholder="Min 6 characters"
            value={form.password} onChange={set('password')} onKeyDown={onKey} />
        </div>

        {/* Confirm password — register only */}
        {tab === 'register' && (
          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input
              className="form-input"
              type="password"
              placeholder="Re-enter your password"
              value={form.confirm_password}
              onChange={set('confirm_password')}
              onKeyDown={onKey}
              style={{
                borderColor: form.confirm_password && form.confirm_password !== form.password ? '#DC2626' : '',
              }}
            />
            {form.confirm_password && form.confirm_password !== form.password && (
              <div style={{ fontSize:12, color:'#DC2626', marginTop:4 }}>Passwords do not match</div>
            )}
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:15, borderRadius:12, marginTop:4 }}
          onClick={submit}
          disabled={loading}
        >
          {loading
            ? <><div className="spinner" style={{ width:16, height:16, borderWidth:2, borderTopColor:'#fff', borderColor:'rgba(255,255,255,0.3)' }} /> Please wait…</>
            : tab === 'login' ? '🚀 Sign In' : '✨ Create Account'
          }
        </button>

        <div style={{ marginTop:24, textAlign:'center', fontSize:12, color:'#9CA3AF' }}>
          By continuing, you agree to our Terms of Service &amp; Privacy Policy.
        </div>
      </div>
    </div>
  )
}
