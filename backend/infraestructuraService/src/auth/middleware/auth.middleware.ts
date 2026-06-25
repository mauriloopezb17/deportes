import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);
  private readonly publicKey: string | null | undefined;

  constructor() {
    const envKey = process.env.JWT_PUBLIC_KEY;
    if (envKey && envKey.trim().length > 0) {
      this.publicKey = envKey.replace(/\\n/g, "\n");
    } else {
      const filePath = path.join(__dirname, "../../config/public.pem");
      if (fs.existsSync(filePath)) {
        this.publicKey = fs.readFileSync(filePath, "utf8");
        this.logger.log("JWT_PUBLIC_KEY cargada desde config/public.pem");
      } else {
        const allowMock = process.env.ALLOW_DEV_MOCK === "true";
        if (allowMock) {
          this.logger.warn("JWT_PUBLIC_KEY no configurada. Usando modo mock (ALLOW_DEV_MOCK=true).");
          this.publicKey = null;
        } else {
          this.logger.error("JWT_PUBLIC_KEY no configurada y ALLOW_DEV_MOCK no está activado.");
          this.publicKey = undefined;
        }
      }
    }
  }

  use(req: any, res: any, next: () => void) {
    if (this.publicKey === null) {
      req.user = { id: 0, rol: "admin", email: "dev@localhost" };
      return next();
    }

    if (this.publicKey === undefined) {
      throw new Error("JWT_PUBLIC_KEY no configurada. Establezca ALLOW_DEV_MOCK=true para modo desarrollo.");
    }

    if (process.env.ALLOW_DEV_MOCK === "true" && !req.headers.authorization) {
      this.logger.warn("Modo mock ALLOW_DEV_MOCK activado. Inyectando usuario de desarrollo.");
      req.user = { id: 0, rol: "admin", email: "dev@localhost" };
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = jwt.verify(token, this.publicKey, {
        algorithms: ["RS256"],
      }) as jwt.JwtPayload;

      req.user = {
        ...payload,
        id: payload.id_usuario ?? payload.id,
        rol: payload.nombre_rol ?? payload.rol ?? payload.role,
      };

      if (!req.user.rol) {
        this.logger.warn(`Token sin rol: ${req.method} ${req.url}`);
        throw new UnauthorizedException("El token no contiene información de rol");
      }

      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Token inválido o expirado");
    }
  }
}
