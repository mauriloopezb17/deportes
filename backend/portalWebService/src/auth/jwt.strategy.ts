import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const publicKeyPath = path.resolve(process.cwd(), 'public.pem');
    let publicKey = '';
    try {
      publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    } catch (error) {
      console.error(`Error reading public.pem from path ${publicKeyPath}:`, error);
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey || 'temp-fallback-secret',
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    return {
      id_usuario: payload.id_usuario ?? payload.sub ?? payload.id,
      email: payload.email,
      id_rol: payload.id_rol,
      nombre_rol: payload.nombre_rol,
      role: payload.nombre_rol ?? payload.role ?? payload.roles,
    };
  }
}
