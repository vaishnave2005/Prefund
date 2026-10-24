import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'pil_portal_jwt_secret_2026_secure',
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      userId: payload.userId,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
      assignedOfficeCode: payload.assignedOfficeCode,
    };
  }
}
