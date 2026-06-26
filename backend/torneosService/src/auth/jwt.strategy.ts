import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get("JWT_SECRET") ||
        "your_jwt_secret_key_change_in_production",
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      persona_id: payload.persona_id,
      email: payload.email,
      roles: payload.roles || [],
      carrera_id: payload.carrera_id,
    };
  }
}
