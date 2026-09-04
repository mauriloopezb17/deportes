import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseFilters,
  Req,
  Res,
  Body,
  Injectable,
  Query,
  Catch,
  UnauthorizedException,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Request } from 'express';
import type { Response } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

interface RequestWithUser extends Request {
  user: any;
}

/* FRONTEND_URL suele venir con barra final en los .env del despliegue. Sin
   limpiarla los redirects quedan como https://host//auth/callback y el router
   del portal no matchea esa ruta: el usuario cae en el catch-all y termina en
   el home sin sesión. */
function frontendUrl(): string {
  return (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(
    /\/+$/,
    '',
  );
}

/* El guard de Google rechaza antes de entrar al handler (cuenta no registrada,
   error de Google), así que el try/catch del controlador nunca lo ve. Este
   filtro convierte ese fallo en una vuelta al login con el código de error que
   LoginPage sabe mostrar. */
@Catch()
class GoogleAuthFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const code =
      exception instanceof UnauthorizedException
        ? 'no_registrado'
        : 'server_error';
    console.error('[AUTH] Fallo en OAuth de Google:', exception);
    res.redirect(`${frontendUrl()}/login?error=${code}`);
  }
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @UseFilters(GoogleAuthFilter)
  @UseGuards(AuthGuard('google'))
  @Get('google')
  googleAuth() {}

  @UseFilters(GoogleAuthFilter)
  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  googleAuthRedirect(@Req() req: RequestWithUser, @Res() res: Response) {
    const { token } = this.authService.login(req.user);
    return res.redirect(
      `${frontendUrl()}/auth/callback?token=${encodeURIComponent(token)}`,
    );
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('verify-reset-code')
  async verifyResetCode(
    @Body('email') email: string,
    @Body('codigo') codigo: string,
  ) {
    return this.authService.verifyResetCode(email, codigo);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('reset_token') resetToken: string,
    @Body('nueva_password') nuevaPassword: string,
  ) {
    return this.authService.resetPassword(resetToken, nuevaPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generar')
  async generar2FA(@Req() req: RequestWithUser) {
    const { id_usuario, email } = req.user;
    return this.authService.generarCodigoQR(id_usuario, email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/confirmar')
  async confirmar2FA(
    @Req() req: RequestWithUser,
    @Body('codigo') codigo: string,
  ) {
    const { id_usuario } = req.user;
    return this.authService.confirmarActivacion2FA(id_usuario, codigo);
  }

  @Post('2fa/activar')
  async activar2FA(
    @Body('email') email: string,
    @Body('activo') activo: boolean,
  ) {
    return this.authService.activarDesactivar2FA(email, activo);
  }

  @Get('2fa/status')
  async obtener2FAStatus(@Query('email') email: string) {
    return this.authService.obtener2FAStatus(email);
  }

  @Post('2fa/verificar')
  async verificar2FA(
    @Body('email') email: string,
    @Body('codigo') codigo: string,
  ) {
    return this.authService.verificar2FA(email, codigo);
  }
}
