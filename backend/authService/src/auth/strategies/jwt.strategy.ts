import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const publicKey = fs.readFileSync(
  path.join(process.cwd(), 'public.pem'),
  'utf8',
);

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    });
  }

  validate(payload: any) {
    return {
      id_usuario: payload.id_usuario,
      email: payload.email,
      id_rol: payload.id_rol,
      nombre_rol: payload.nombre_rol,
    };
  }
}
