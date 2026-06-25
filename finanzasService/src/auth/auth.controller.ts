import { Controller, Post, Req, HttpCode, Logger } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  @Post("logout")
  @Roles("admin", "entrenador", "delegado", "deportista")
  @HttpCode(204)
  logout(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub ?? "desconocido";
    this.logger.log(`Sesión cerrada para usuario: ${userId}`);
  }
}
