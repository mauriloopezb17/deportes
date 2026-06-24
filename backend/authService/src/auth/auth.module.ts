import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import * as fs from 'fs';
import * as path from 'path';

const privateKey = fs.readFileSync(
  path.join(process.cwd(), 'private.pem'),
  'utf8',
);
const publicKey = fs.readFileSync(
  path.join(process.cwd(), 'public.pem'),
  'utf8',
);

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      privateKey: privateKey,
      publicKey: publicKey,
      signOptions: {
        algorithm: 'RS256',
        expiresIn: '8h',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, GoogleStrategy, JwtStrategy],
})
export class AuthModule {}
