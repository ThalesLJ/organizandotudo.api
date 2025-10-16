import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EncryptionService } from './services/encryption.service';
import { EmailService } from './services/email.service';
import { Setting, SettingSchema } from './schemas/setting.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
  ],
  providers: [EncryptionService, EmailService],
  exports: [EncryptionService, EmailService],
})
export class CommonModule {}
