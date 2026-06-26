import {
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Res,
  Body,
  Injectable,
  Query,
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

  @UseGuards(AuthGuard('google'))
  @Get('google')
  googleAuth() {}

  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  googleAuthRedirect(@Req() req: RequestWithUser, @Res() res: Response) {
    try {
      const { token } = this.authService.login(req.user);
      const frontendURL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

      return res.redirect(`${frontendURL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Error en callback:', error);
      const frontendURL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
      return res.redirect(`${frontendURL}/login?error=server_error`);
    }
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
