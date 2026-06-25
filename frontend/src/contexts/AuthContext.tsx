import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { getToken, clearToken } from '../utils/api'

interface JWTPayload {
  id_usuario: number
  email: string
  id_rol: number
  nombre_rol: string
  nombres?: string
  ape_paterno?: string
}

interface AuthContextType {
  user: JWTPayload | null
  isAdmin: boolean
  isAuthenticated: boolean
  loading: boolean
  logout: () => void
  refreshAuth: () => void
}

function decodeJWT(token: string): JWTPayload | null {
  try {
    const part = token.split('.')[1]
    return JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isAuthenticated: false,
  loading: true,
  logout: () => {},
  refreshAuth: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<JWTPayload | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshAuth = () => {
    const token = getToken()
    setUser(token ? decodeJWT(token) : null)
  }

  useEffect(() => {
    refreshAuth()
    setLoading(false)
  }, [])

  const logout = () => {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.id_rol === 1,
        isAuthenticated: user !== null,
        loading,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
