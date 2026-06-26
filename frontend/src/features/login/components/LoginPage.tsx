//pagina de login para el depto de deportes ucb
import { useState, useRef, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { login, forgotPassword, verifyResetCode, resetPassword, googleAuthUrl, panelPathForUser, panelAppUrlForUser, bridgeSessionToPanel } from "../services/loginService";
import { useAuth } from "../../../contexts/AuthContext";

const ERROR_MESSAGES: Record<string, string> = {
  no_registrado:
    "Tu cuenta de Google no está registrada en el sistema. Contactá al administrador para solicitar acceso.",
  server_error:
    "Ocurrió un error inesperado. Intentá de nuevo más tarde.",
};

// ── Password visibility toggle icon ──────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

type ResetStep = 'email' | 'code' | 'password' | 'done'

// ── Component ─────────────────────────────────────────────────────────────────

function LoginPage() {
  const params = new URLSearchParams(window.location.search);
  const urlError = ERROR_MESSAGES[params.get("error") ?? ""] ?? null;

  const { refreshAuth } = useAuth();
  const navigate = useNavigate();

  // ── Login state
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Forgot-password state
  const [view, setView]             = useState<'login' | 'forgot'>('login')
  const [resetStep, setResetStep]   = useState<ResetStep>('email')
  const [resetEmail, setResetEmail] = useState('')
  const [resetCode, setResetCode]   = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword]   = useState('')
  const [showNewPwd, setShowNewPwd]     = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError]     = useState('')
  const [, setResetSuccess]             = useState('')
  const codeRefs = useRef<(HTMLInputElement | null)[]>([])

  // ── Login handler
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      localStorage.setItem("ucb_token", data.token);
      refreshAuth();
      // admin/delegado/entrenador -> panel del grupo 2 (app aparte bajo /gestion).
      const panelUrl = panelAppUrlForUser(data.user ?? {});
      if (panelUrl) {
        bridgeSessionToPanel(data.token, data.user ?? {});
        window.location.href = panelUrl; // navegación de página completa a la otra app
        return;
      }
      navigate(panelPathForUser(data.user ?? {}), { replace: true });
    } catch (err: any) {
      setFormError(err.message ?? "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot-password handlers

  const openForgot = () => {
    setResetEmail(email) // pre-fill if user already typed their email
    setResetStep('email')
    setResetError('')
    setResetSuccess('')
    setResetCode('')
    setNewPassword('')
    setConfirmPassword('')
    setView('forgot')
  }

  const closeForgot = () => {
    setView('login')
    setResetStep('email')
    setResetError('')
    setResetSuccess('')
  }

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault()
    setResetError('')
    setResetLoading(true)
    try {
      await forgotPassword(resetEmail.trim())
      setResetStep('code')
    } catch (err: any) {
      setResetError(err.message ?? 'Error al enviar el código.')
    } finally {
      setResetLoading(false)
    }
  }

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault()
    setResetError('')
    const code = resetCode.trim()
    if (code.length !== 6) { setResetError('El código debe tener 6 dígitos.'); return }
    setResetLoading(true)
    try {
      const data = await verifyResetCode(resetEmail.trim(), code)
      setResetToken(data.reset_token)
      setResetStep('password')
    } catch (err: any) {
      setResetError(err.message ?? 'Código inválido o expirado.')
    } finally {
      setResetLoading(false)
    }
  }

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault()
    setResetError('')
    if (newPassword.length < 8) { setResetError('La contraseña debe tener al menos 8 caracteres.'); return }
    if (newPassword !== confirmPassword) { setResetError('Las contraseñas no coinciden.'); return }
    setResetLoading(true)
    try {
      await resetPassword(resetToken, newPassword)
      setResetStep('done')
    } catch (err: any) {
      setResetError(err.message ?? 'Error al cambiar la contraseña.')
    } finally {
      setResetLoading(false)
    }
  }

  // Handle 6-box code input
  const handleCodeInput = (i: number, val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 1)
    const arr = resetCode.split('')
    while (arr.length < 6) arr.push('')
    arr[i] = digits
    const next = arr.join('')
    setResetCode(next)
    if (digits && i < 5) codeRefs.current[i + 1]?.focus()
  }

  const handleCodeKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const arr = resetCode.split('')
      while (arr.length < 6) arr.push('')
      if (arr[i]) {
        arr[i] = ''
        setResetCode(arr.join(''))
      } else if (i > 0) {
        codeRefs.current[i - 1]?.focus()
      }
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) {
      setResetCode(pasted.padEnd(6, ''))
      codeRefs.current[Math.min(pasted.length, 5)]?.focus()
    }
    e.preventDefault()
  }

  // ── Step indicators
  const steps = ['Correo', 'Código', 'Contraseña']
  const stepIndex = resetStep === 'email' ? 0 : resetStep === 'code' ? 1 : 2

  return (
    <div className="login-page">
      <div className="login-topbar">
        <img src="/ucb-assets/UCB%20escudo.png" alt="UCB" className="topbar-logo" />
      </div>

      <div className="login-content">
        <div className={`login-card${view === 'forgot' ? ' login-card--forgot' : ''}`}>

          {/* ── LOGIN VIEW ────────────────────────────────────────────────── */}
          {view === 'login' && (
            <>
              <div className="login-header">
                <img src="/ucb-assets/UCB%20escudo.png" alt="Universidad Católica Boliviana" className="login-logo" />
                <h1 className="login-title">Departamento de Deportes</h1>
                <p className="login-subtitle">Iniciá sesión para continuar</p>
              </div>

              <form className="login-form" noValidate onSubmit={handleLogin}>
                {(urlError || formError) && (
                  <div className="login-error" role="alert">{urlError ?? formError}</div>
                )}

                <div className="input-group">
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    className="input-field"
                    placeholder="usuario@ucb.edu.bo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="input-group">
                  <div className="input-label-row">
                    <label htmlFor="password">Contraseña</label>
                    <button type="button" className="forgot-link" onClick={openForgot}>
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="password-wrapper">
                    <input
                      id="password"
                      type={showPwd ? "text" : "password"}
                      className="input-field"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button type="button" className="toggle-password" onClick={() => setShowPwd(v => !v)} aria-label={showPwd ? "Ocultar" : "Mostrar"}>
                      <EyeIcon open={showPwd} />
                    </button>
                  </div>
                </div>

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </button>

                <div className="login-divider"><span>o</span></div>

                <button type="button" className="google-btn" onClick={() => (window.location.href = googleAuthUrl())}>
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continuar con Google
                </button>
              </form>

              <div className="login-footer">
                <Link to="/">← Volver al inicio</Link>
              </div>
            </>
          )}

          {/* ── FORGOT PASSWORD VIEW ──────────────────────────────────────── */}
          {view === 'forgot' && (
            <div className="forgot-panel">
              <button type="button" className="forgot-back" onClick={closeForgot}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Volver al inicio de sesión
              </button>

              <div className="login-header" style={{ marginBottom: 24 }}>
                <h1 className="login-title">Recuperar contraseña</h1>
                <p className="login-subtitle">
                  {resetStep === 'email'    && 'Ingresá tu correo para recibir un código de verificación.'}
                  {resetStep === 'code'     && `Ingresá el código de 6 dígitos enviado a ${resetEmail}.`}
                  {resetStep === 'password' && 'Elegí una nueva contraseña segura.'}
                  {resetStep === 'done'     && '¡Tu contraseña fue actualizada correctamente!'}
                </p>
              </div>

              {/* Step indicator */}
              {resetStep !== 'done' && (
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

              {resetError && <div className="login-error" style={{ marginBottom: 16 }}>{resetError}</div>}

              {/* Step 1: Email */}
              {resetStep === 'email' && (
                <form className="login-form" onSubmit={handleSendCode}>
                  <div className="input-group">
                    <label htmlFor="reset-email">Correo electrónico</label>
                    <input
                      id="reset-email"
                      type="email"
                      className="input-field"
                      placeholder="usuario@ucb.edu.bo"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <button type="submit" className="login-btn" disabled={resetLoading}>
                    {resetLoading ? 'Enviando...' : 'Enviar código'}
                  </button>
                </form>
              )}

              {/* Step 2: Code */}
              {resetStep === 'code' && (
                <form className="login-form" onSubmit={handleVerifyCode}>
                  <div className="code-input-group">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <input
                        key={i}
                        ref={el => { codeRefs.current[i] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="code-box"
                        value={resetCode[i] ?? ''}
                        onChange={e => handleCodeInput(i, e.target.value)}
                        onKeyDown={e => handleCodeKeyDown(i, e)}
                        onPaste={i === 0 ? handleCodePaste : undefined}
                        autoFocus={i === 0}
                        autoComplete="one-time-code"
                      />
                    ))}
                  </div>
                  <button type="submit" className="login-btn" disabled={resetLoading || resetCode.replace(/\s/g, '').length < 6}>
                    {resetLoading ? 'Verificando...' : 'Verificar código'}
                  </button>
                  <button type="button" className="reset-resend" onClick={handleSendCode} disabled={resetLoading}>
                    No recibí el código · Reenviar
                  </button>
                </form>
              )}

              {/* Step 3: New password */}
              {resetStep === 'password' && (
                <form className="login-form" onSubmit={handleResetPassword}>
                  <div className="input-group">
                    <label htmlFor="new-password">Nueva contraseña</label>
                    <div className="password-wrapper">
                      <input
                        id="new-password"
                        type={showNewPwd ? 'text' : 'password'}
                        className="input-field"
                        placeholder="Mínimo 8 caracteres"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        autoFocus
                        minLength={8}
                      />
                      <button type="button" className="toggle-password" onClick={() => setShowNewPwd(v => !v)}>
                        <EyeIcon open={showNewPwd} />
                      </button>
                    </div>
                    <PasswordStrength password={newPassword} />
                  </div>
                  <div className="input-group">
                    <label htmlFor="confirm-password">Confirmar contraseña</label>
                    <input
                      id="confirm-password"
                      type={showNewPwd ? 'text' : 'password'}
                      className="input-field"
                      placeholder="Repetí la contraseña"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="login-btn" disabled={resetLoading}>
                    {resetLoading ? 'Guardando...' : 'Cambiar contraseña'}
                  </button>
                </form>
              )}

              {/* Step 4: Done */}
              {resetStep === 'done' && (
                <div className="reset-done">
                  <div className="reset-done-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p>Podés iniciar sesión con tu nueva contraseña.</p>
                  <button type="button" className="login-btn" style={{ marginTop: 8 }} onClick={closeForgot}>
                    Ir al inicio de sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="login-copyright">
        © {new Date().getFullYear()} Universidad Católica Boliviana "San Pablo"
      </div>
    </div>
  );
}

// ── Password strength meter ───────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const score =
    (password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0)
  const labels = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte']
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a']
  return (
    <div className="pwd-strength">
      <div className="pwd-strength-bar">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="pwd-strength-seg"
            style={{ background: i < score ? colors[score] : undefined }}
          />
        ))}
      </div>
      <span className="pwd-strength-label" style={{ color: colors[score] }}>
        {labels[score]}
      </span>
    </div>
  )
}

export default LoginPage;
