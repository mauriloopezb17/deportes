import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Construction } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import './EntrenadorPanel.css'

/* Placeholder panel for the "entrenador" role. Not yet implemented. */
function EntrenadorPanel() {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/login', { replace: true })
  }, [loading, isAuthenticated, navigate])

  return (
    <div className="entrenador-panel">
      <div className="panel-placeholder">
        <div className="panel-placeholder-icon">
          <Users size={40} strokeWidth={1.8} />
        </div>
        <h1>Panel del Entrenador</h1>
        <p>Aquí los entrenadores podrán gestionar a sus deportistas y horarios.</p>
        <span className="panel-placeholder-tag">
          <Construction size={14} /> En construcción
        </span>
      </div>
    </div>
  )
}

export default EntrenadorPanel
