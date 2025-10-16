import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { EncryptionService } from '../common/services/encryption.service';
import { EmailService } from '../common/services/email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { User } from '../users/schemas/user.schema';
import { Code } from './schemas/code.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
    private readonly emailService: EmailService,
    @InjectModel(Code.name) private codeModel: Model<Code>,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByUsernameOrEmail(username, email);
    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash password (irreversível)
    const hashedPassword = await this.encryptionService.hashPassword(password);

    // Create user
    const user = await this.usersService.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const payload = {
      sub: user._id,
      username: user.username,
      email: user.email,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'User successfully registered',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Find user by username
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare password using bcrypt
    const isPasswordValid = await this.encryptionService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      sub: user._id,
      username: user.username,
      email: user.email,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'User successfully logged in',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };
  }



  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user) {
      const isPasswordValid = await this.encryptionService.comparePassword(password, user.password);
      if (isPasswordValid) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async sendCode(sendCodeDto: SendCodeDto) {
    const { email } = sendCodeDto;

    // Verificar se o email existe no sistema
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Email not found in our system');
    }

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Salvar código na collection Codes
    const codeDocument = new this.codeModel({
      email,
      userId: user._id.toString(),
      code,
    });
    await codeDocument.save();

    // Enviar email usando serviço interno
    const emailHtml = this.generateEmailTemplate(code);
    
    const emailSent = await this.emailService.sendEmail(
      email,
      'Organizando Tudo | Change Password',
      emailHtml,
      true
    );

    if (!emailSent) {
      throw new BadRequestException('Failed to send verification email');
    }

    return {
      message: 'Verification code sent successfully',
      email: email,
    };
  }

  async verifyCode(verifyCodeDto: VerifyCodeDto) {
    const { code, password } = verifyCodeDto;

    // Buscar código na collection Codes
    const codeDocument = await this.codeModel.findOne({
      code,
      used: false,
      expiresAt: { $gt: new Date() },
    }).exec();

    if (!codeDocument) {
      throw new BadRequestException('Invalid or expired code');
    }

    // Verificar se o usuário existe
    const user = await this.usersService.findById(codeDocument.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verificar se o email bate
    if (user.email !== codeDocument.email) {
      throw new BadRequestException('Email mismatch');
    }

    // Marcar código como usado
    codeDocument.used = true;
    await codeDocument.save();

    // Criptografar nova senha
    const hashedPassword = await this.encryptionService.hashPassword(password);

    // Atualizar senha do usuário
    await this.usersService.update(user._id.toString(), {
      password: hashedPassword,
    });

    // Enviar email de notificação de alteração de senha
    const notificationHtml = this.generatePasswordChangedTemplate(user.username);
    
    const notificationSent = await this.emailService.sendEmail(
      user.email,
      'Organizando Tudo | Password Changed',
      notificationHtml,
      true
    );

    if (!notificationSent) {
      // Log error but don't fail the password update
      console.error('Failed to send password change notification email');
    }

    return {
      message: 'Password updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };
  }

  private generateEmailTemplate(code: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            .email-wrapper {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .container {
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            .logo {
                margin-bottom: 30px;
            }
            .logo-icon {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #ff6b35, #2c5aa0);
                border-radius: 12px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 15px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .logo-text {
                font-size: 20px;
                font-weight: bold;
                color: #2c3e50;
                margin: 0;
            }
            .title {
                color: #2c3e50;
                font-size: 24px;
                font-weight: bold;
                margin: 20px 0 30px 0;
            }
            .message {
                color: #6c757d;
                font-size: 16px;
                margin: 20px 0;
                line-height: 1.5;
            }
            .code-container {
                background-color: #f8f9fa;
                border: 2px dashed #dee2e6;
                border-radius: 12px;
                padding: 40px 30px;
                margin: 30px 0;
                text-align: center;
            }
            .code {
                font-size: 42px;
                font-weight: bold;
                color: #2c3e50;
                letter-spacing: 6px;
                font-family: 'Courier New', monospace;
                margin: 0;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 30px 0;
                color: #856404;
                text-align: left;
                font-size: 14px;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                color: #6c757d;
                font-size: 12px;
                text-align: center;
            }
            .disclaimer {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #6c757d;
                font-size: 11px;
                text-align: justify;
                line-height: 1.4;
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="container">
                <div class="title">Verification Code</div>
                
                <div class="message">
                    <p>You requested to change your password. Use the code below to continue:</p>
                </div>
                
                <div class="code-container">
                    <div class="code">${code}</div>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong> This code is valid for only 10 minutes and can be used only once. If you did not request this change, please ignore this email.
                </div>
                
                <div class="footer">
                    <p>This is an automated email, please do not reply to this message.</p>
                    <p>© ${new Date().getFullYear()} Organizando Tudo</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generatePasswordChangedTemplate(username: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed Successfully</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            .email-wrapper {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .container {
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            .logo {
                margin-bottom: 30px;
            }
            .logo-icon {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #28a745, #20c997);
                border-radius: 12px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 15px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .logo-text {
                font-size: 20px;
                font-weight: bold;
                color: #2c3e50;
                margin: 0;
            }
            .title {
                color: #2c3e50;
                font-size: 24px;
                font-weight: bold;
                margin: 20px 0 30px 0;
            }
            .message {
                color: #28a745;
                font-size: 16px;
                margin: 20px 0;
                line-height: 1.5;
            }
            .info-box {
                background-color: #f8f9fa;
                border: 2px dashed #dee2e6;
                border-radius: 12px;
                padding: 40px 30px;
                margin: 30px 0;
                text-align: left;
                color: #004085;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 30px 0;
                color: #856404;
                text-align: left;
                font-size: 14px;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                color: #6c757d;
                font-size: 12px;
                text-align: center;
            }
            .disclaimer {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #6c757d;
                font-size: 11px;
                text-align: justify;
                line-height: 1.4;
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="container">
                <div class="title">${username},</div>
                
                <div class="message">
                    <p>Your password has been changed successfully.</p>
                </div>
                
                <div class="info-box">
                    <strong>📋 Account Information:</strong><br>
                    • Username: ${username}<br>
                    • Change Date: ${new Date().toLocaleString('pt-BR', { 
                      timeZone: 'America/Sao_Paulo', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} (Brazilian Time)
                </div>
                
                <div class="warning">
                    <strong>🔒 Important:</strong> If you did not request this change, please contact support immediately.
                </div>
                
                <div class="footer">
                    <p>This is an automated email, please do not reply to this message.</p>
                    <p>© ${new Date().getFullYear()} Organizando Tudo</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}
