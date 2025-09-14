import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  constructor(private readonly configService: ConfigService) {}

  private getKey(): Buffer {
    const secret = this.configService.get<string>('ENCRYPTION_KEY');
    if (!secret) {
      throw new Error('ENCRYPTION_KEY not configured');
    }
    return crypto.scryptSync(secret, 'salt', this.keyLength);
  }

  // ===== MÉTODOS PARA SENHAS (HASH - IRREVERSÍVEL) =====
  
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // ===== MÉTODOS PARA DADOS (CRIPTOGRAFIA - REVERSÍVEL) =====

  encryptData(data: string): string {
    try {
      const key = this.getKey();
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipher(this.algorithm, key);
      cipher.setAAD(Buffer.from('additional-data'));
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Formato: iv:tag:encrypted
      return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
    } catch (error) {
      throw new Error('Data encryption failed');
    }
  }

  decryptData(encryptedData: string): string {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const tag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      const key = this.getKey();

      const decipher = crypto.createDecipher(this.algorithm, key);
      decipher.setAAD(Buffer.from('additional-data'));
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('Data decryption failed');
    }
  }

  // ===== MÉTODOS LEGADOS (PARA COMPATIBILIDADE) =====
  
  encrypt(data: string): string {
    return this.encryptData(data);
  }

  decrypt(encryptedData: string): string {
    return this.decryptData(encryptedData);
  }
}
