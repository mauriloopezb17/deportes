import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private usersService: UsersService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.CALLBACK_URL!,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      return done(
        new UnauthorizedException('No se pudo obtener el correo de Google'),
        false,
      );
    }

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      console.log(
        `[AUTH] Intento de acceso denegado (No registrado): ${email}`,
      );
      return done(
        new UnauthorizedException(
          'Cuenta no registrada en el sistema. Contacta al administrador.',
        ),
        false,
      );
    }

    console.log(
      `[AUTH] Login exitoso con Google: ${email} | Rol: ${user.rol.nombre_rol}`,
    );
    done(null, user);
  }
}
