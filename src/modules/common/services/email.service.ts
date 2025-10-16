import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting } from '../schemas/setting.schema';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectModel(Setting.name) private settingModel: Model<Setting>,
  ) {}

  async sendEmail(to: string, subject: string, body: string, isHtml: boolean = false): Promise<boolean> {
    try {
      // Buscar configurações de email do banco
      const emailSetting = await this.settingModel.findOne({ name: 'EMAIL_ADDRESS' }).exec();
      const passwordSetting = await this.settingModel.findOne({ name: 'EMAIL_PASSWORD' }).exec();

      if (!emailSetting?.value || !passwordSetting?.value) {
        return false;
      }

      // Configurar transporter do Gmail
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true para 465, false para outras portas
        auth: {
          user: emailSetting.value,
          pass: passwordSetting.value,
        },
      });

      // Configurar mensagem
      const mailOptions = {
        from: {
          name: 'Organizando Tudo',
          address: emailSetting.value,
        },
        to: to,
        subject: subject,
        text: isHtml ? undefined : body,
        html: isHtml ? body : undefined,
      };

      // Enviar email
      const result = await transporter.sendMail(mailOptions);
      return true;

    } catch (error) {
      return false;
    }
  }
}
