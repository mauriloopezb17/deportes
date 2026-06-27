import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Los tokens los firma authService con RS256 (private.pem). Verificamos con
      // la clave publica, igual que deportistasService; el JWT_SECRET/HS256 que
      // habia antes no podia validar estos tokens y devolvia 401 (el panel del
      // entrenador rebotaba al login).
      secretOrKey: fs.readFileSync(
        path.resolve(
          process.cwd(),
          process.env.PUBLIC_KEY_PATH || "./public.pem",
        ),
        "utf8",
      ),
      algorithms: ["RS256"],
    });
  }

  // Payload real emitido por authService: { id_usuario, email, id_rol, nombre_rol }.
  // Exponemos `id` (lo usa el controller del panel entrenador como id_usuario) y
  // `roles` normalizado (lo usa RolesGuard contra @Roles("ENTRENADOR")), ademas de
  // conservar los campos crudos por compatibilidad.
  async validate(payload: any) {
    const nombreRol = String(payload.nombre_rol ?? "")
      .trim()
      .toUpperCase();

    return {
      id: payload.id_usuario,
      id_usuario: payload.id_usuario,
      email: payload.email,
      id_rol: payload.id_rol,
      nombre_rol: payload.nombre_rol,
      roles: nombreRol ? [nombreRol] : [],
    };
  }
}
