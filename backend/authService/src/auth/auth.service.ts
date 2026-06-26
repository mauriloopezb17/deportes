import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { generateSecret, generateURI, verify } from 'otplib';
import * as qrcode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private redisService: RedisService,
    private prisma: PrismaService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  login(user: any) {
    const payload = {
      id_usuario: user.id_usuario,
      email: user.email,
      id_rol: user.id_rol,
      nombre_rol: user.rol.nombre_rol,
    };
    return {
      message: 'Inicio de sesión exitoso',
      token: this.jwtService.sign(payload),
      user: {
        id_usuario: user.id_usuario,
        email: user.email,
        id_rol: user.id_rol,
        nombre_rol: user.rol.nombre_rol,
        nombres: user.persona.nombres,
        ape_paterno: user.persona.ape_paterno,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    const responseMessage = {
      message:
        'Si el correo está registrado, recibirás un código en tu bandeja.',
    };
    if (!user) return responseMessage;
    const codigo = crypto.randomInt(100000, 999999).toString();
    await this.redisService.setWithExpiry(`reset_code:${email}`, codigo, 900);
    await this.transporter.sendMail({
      from: `"Deportes UCB" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Código para restablecer tu contraseña',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <h2 style="color: #1a1a2e;">Restablecer contraseña</h2>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
          <p>Tu código de verificación es:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e; margin: 24px 0;">
            ${codigo}
          </div>
          <p style="color: #666;">Este código expira en <strong>15 minutos</strong>.</p>
        </div>
      `,
    });

    return responseMessage;
  }

  async verifyResetCode(email: string, codigo: string) {
    const redisCode = await this.redisService.get(`reset_code:${email}`);

    if (!redisCode || redisCode !== codigo) {
      throw new BadRequestException('Código inválido o expirado');
    }
    await this.redisService.delete(`reset_code:${email}`);
    const resetToken = this.jwtService.sign(
      { email, purpose: 'password_reset' },
      { expiresIn: '10m' },
    );
    return { valid: true, reset_token: resetToken };
  }

  async resetPassword(resetToken: string, nueva_password: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(resetToken);
    } catch {
      throw new BadRequestException('Token inválido o expirado');
    }
    if (payload.purpose !== 'password_reset') {
      throw new BadRequestException('Token no válido para esta acción');
    }
    const hash = await bcrypt.hash(nueva_password, 10);
    await this.usersService.updatePassword(payload.email, hash);
    return { message: 'Contraseña actualizada correctamente' };
  }

  async generarCodigoQR(id_usuario: number, email: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Validación Anti-Google
    if (!user.hash_password || user.hash_password === '') {
      throw new BadRequestException(
        'Debes configurar tu 2FA directamente desde tu cuenta de Google.',
      );
    }

    // Generar secreto TOTP
    const secret = generateSecret();

    // Generar URL del autenticador
    const otpauthUrl = generateURI({
      issuer: 'DeportesUCB',
      label: email,
      secret: secret,
    });

    // Actualizar la base de datos
    await this.prisma.usuario.update({
      where: { id_usuario },
      data: { dos_fa_secret: secret },
    });

    // Convertir la URL en imagen Base64
    const qrCodeImage = await qrcode.toDataURL(otpauthUrl);

    return {
      success: true,
      message: 'Código QR generado con éxito',
      qrCode: qrCodeImage,
    };
  }

  async activarDesactivar2FA(email: string, activo: boolean) {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (activo && !user.dos_fa_secret) {
      throw new BadRequestException(
        'Debe generar el código QR de 2FA antes de activarlo.',
      );
    }

    const updatedUser = await this.prisma.usuario.update({
      where: { email },
      data: { dos_fa_activo: activo },
    });

    return {
      success: true,
      message: activo
        ? 'Autenticación de dos factores activada con éxito'
        : 'Autenticación de dos factores desactivada con éxito',
      dos_fa_activo: updatedUser.dos_fa_activo,
    };
  }

  async obtener2FAStatus(email: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    return {
      email: user.email,
      dos_fa_activo: user.dos_fa_activo,
    };
  }

  async verificar2FA(email: string, codigo: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        persona: true,
        rol: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (!user.dos_fa_activo || !user.dos_fa_secret) {
      throw new BadRequestException(
        'El usuario no tiene la autenticación de dos factores (2FA) activa.',
      );
    }

    const result = await verify({
      token: codigo,
      secret: user.dos_fa_secret,
    });

    if (!result.valid) {
      throw new BadRequestException('Código de verificación incorrecto.');
    }

    return this.login(user);
  }
}

