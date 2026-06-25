import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Construction } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import './DelegadoPanel.css'

/* Placeholder panel for the "delegado" role. Not yet implemented. */
function DelegadoPanel() {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/login', { replace: true })
  }, [loading, isAuthenticated, navigate])

  return (
    <div className="delegado-panel">
      <div className="panel-placeholder">
        <div className="panel-placeholder-icon">
          <ClipboardList size={40} strokeWidth={1.8} />
        </div>
        <h1>Panel del Delegado</h1>
        <p>Aquí los delegados podrán gestionar a su equipo y sus partidos.</p>
        <span className="panel-placeholder-tag">
          <Construction size={14} /> En construcción
        </span>
      </div>
    </div>
  )
}

export default DelegadoPanel
