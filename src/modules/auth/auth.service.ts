import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EncryptionService } from '../common/services/encryption.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
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
}
