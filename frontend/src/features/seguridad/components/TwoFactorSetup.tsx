// Configuración de verificación en dos pasos (2FA).
// Mismo look que el flujo de "recuperar contraseña": reutiliza LoginPage.css.
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import '../../login/components/LoginPage.css'
import { generar2FA } from '../services/twofaService'
import { useAuth } from '../../../contexts/AuthContext'

type Step = 'intro' | 'qr' | 'done'

function TwoFactorSetup() {
  const { user, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]     = useState<Step>('intro')
  const [qrCode, setQrCode] = useState('')
  const [busy, setBusy]     = useState(false)
  const [error, setError]   = useState('')

  // El endpoint es protegido: si no hay sesión, al login.
  if (!loading && !isAuthenticated) return <Navigate to="/login" replace />

  const handleGenerate = async () => {
    setError('')
    setBusy(true)
    try {
      const data = await generar2FA()
      setQrCode(data.qrCode)
      setStep('qr')
    } catch (err: any) {
      setError(err.message ?? 'No se pudo generar el código QR.')
    } finally {
      setBusy(false)
    }
  }

  // Indicador de pasos (igual estilo que el de recuperar contraseña)
  const steps = ['Generar', 'Escanear']
  const stepIndex = step === 'intro' ? 0 : 1

  return (
    <div className="login-page">
      <div className="login-topbar">
        <img src="/ucb-assets/UCB%20escudo.png" alt="UCB" className="topbar-logo" />
      </div>

      <div className="login-content">
        <div className="login-card login-card--forgot">
          <div className="forgot-panel">
            <button type="button" className="forgot-back" onClick={() => navigate(-1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Volver
            </button>

            <div className="login-header" style={{ marginBottom: 24 }}>
              <h1 className="login-title">Verificación en dos pasos</h1>
              <p className="login-subtitle">
                {step === 'intro' && 'Añadí una capa extra de seguridad a tu cuenta con una app de autenticación.'}
                {step === 'qr'    && `Escaneá el código QR con tu app de autenticación${user?.email ? ` para ${user.email}` : ''}.`}
                {step === 'done'  && '¡Listo! La verificación en dos pasos quedó configurada.'}
              </p>
            </div>

            {/* Step indicator */}
            {step !== 'done' && (
              <div className="reset-steps">
                {steps.map((label, i) => (
                  <div key={label} className={`reset-step${i <= stepIndex ? ' active' : ''}${i < stepIndex ? ' done' : ''}`}>
                    <span className="reset-step-dot">
                      {i < stepIndex
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        : i + 1
                      }
                    </span>
                    <span className="reset-step-label">{label}</span>
                  </div>
                ))}
              </div>
            )}

            {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}

            {/* Step 1: Intro / generar */}
            {step === 'intro' && (
              <div className="login-form">
                <p className="login-subtitle" style={{ textAlign: 'left', marginBottom: 4 }}>
                  Vas a necesitar una app como <strong>Google Authenticator</strong>, <strong>Authy</strong> o <strong>Microsoft Authenticator</strong>. Al activarla, te pedirá un código temporal además de tu contraseña.
                </p>
                <button type="button" className="login-btn" disabled={busy} onClick={handleGenerate}>
                  {busy ? 'Generando...' : 'Generar código QR'}
                </button>
              </div>
            )}

            {/* Step 2: QR */}
            {step === 'qr' && (
              <div className="login-form">
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 12px' }}>
                  <img
                    src={qrCode}
                    alt="Código QR para verificación en dos pasos"
                    width={200}
                    height={200}
                    style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 8, background: '#fff' }}
                  />
                </div>
                <ol style={{ textAlign: 'left', paddingLeft: 18, margin: '0 0 8px', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                  <li>Abrí tu app de autenticación.</li>
                  <li>Tocá "Escanear código QR" y apuntá a la imagen.</li>
                  <li>Guardá la entrada que aparece para esta cuenta.</li>
                </ol>
                <button type="button" className="login-btn" onClick={() => setStep('done')}>
                  Ya lo escaneé
                </button>
              </div>
            )}

            {/* Step 3: Done */}
            {step === 'done' && (
              <div className="reset-done">
                <div className="reset-done-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p>Tu cuenta ya cuenta con verificación en dos pasos. La próxima vez que inicies sesión, te pediremos el código de tu app.</p>
                <button type="button" className="login-btn" style={{ marginTop: 8 }} onClick={() => navigate('/')}>
                  Volver al inicio
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="login-copyright">
        © {new Date().getFullYear()} Universidad Católica Boliviana "San Pablo"
      </div>
    </div>
  )
}

export default TwoFactorSetup
