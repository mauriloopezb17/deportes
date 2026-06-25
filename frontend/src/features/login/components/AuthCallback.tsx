import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { panelPathForUser } from '../services/loginService'

function AuthCallback() {
  const navigate = useNavigate()
  const { refreshAuth } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search || window.location.hash.replace(/^#/, ''),
    )
    const token = params.get('token') || params.get('access_token')
    let destination = '/'
    if (token) {
      try {
        localStorage.setItem('ucb_token', token)
        console.log("JWT Token:", token);
        refreshAuth()
        const payload = JSON.parse(
          atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
        )
        destination = panelPathForUser(payload ?? {})
      } catch {
        // ignore decode / storage failures
      }
    }
    navigate(destination, { replace: true })
  }, [navigate, refreshAuth])

  return (
    <div style={{ padding: '4rem', textAlign: 'center', color: '#052845' }}>
      Completando inicio de sesión...
    </div>
  )
}

export default AuthCallback
