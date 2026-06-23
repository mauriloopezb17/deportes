import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Construction } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import './FinanzasPanel.css'

/* Placeholder panel for the "deportista" role. Not yet implemented. */
function FinanzasPanel() {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/login', { replace: true })
  }, [loading, isAuthenticated, navigate])

  return (
    <div className="finanzas-panel">
      <div className="panel-placeholder">
        <div className="panel-placeholder-icon">
          <Wallet size={40} strokeWidth={1.8} />
        </div>
        <h1>Panel de Finanzas</h1>
        <p>Aquí los deportistas podrán consultar sus pagos y estados de cuenta.</p>
        <span className="panel-placeholder-tag">
          <Construction size={14} /> En construcción
        </span>
      </div>
    </div>
  )
}

export default FinanzasPanel
