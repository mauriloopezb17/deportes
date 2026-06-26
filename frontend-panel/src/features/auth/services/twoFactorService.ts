import { apiClient } from "@/services/api";

// Capa de red para 2FA (autenticacion de dos factores). Endpoints reales del
// authService: /api/auth/2fa/*. La verificacion del codigo en login vive en
// authService porque devuelve la misma forma que el login ({ token, user }).

// El apiClient envuelve las respuestas de forma inconsistente segun si el
// backend incluye o no la clave "success", asi que leemos ambas formas.
const unwrap = (res: any) => res?.data ?? res ?? {};

export const twoFactorService = {
  // Indica si el usuario tiene el 2FA activo (para decidir si pedir el codigo).
  async status(email: string): Promise<boolean> {
    const res = await apiClient.get<any>("/auth/2fa/status", { email });
    return Boolean(unwrap(res).dos_fa_activo);
  },

  // Genera el secreto TOTP y devuelve el QR (data URL) para escanear.
  async generar(): Promise<string> {
    const res = await apiClient.post<any>("/auth/2fa/generar");
    return unwrap(res).qrCode ?? "";
  },

  // Activa o desactiva el 2FA para el correo indicado.
  async activar(email: string, activo: boolean): Promise<boolean> {
    const res = await apiClient.post<any>("/auth/2fa/activar", {
      email,
      activo,
    });
    return Boolean(unwrap(res).dos_fa_activo);
  },
};
