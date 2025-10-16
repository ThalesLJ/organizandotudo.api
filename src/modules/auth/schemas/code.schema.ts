import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Code extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  code: string;

  @Prop({ 
    type: Date, 
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutos a partir de agora
    expires: 0 // TTL baseado no valor do campo
  })
  expiresAt: Date;

  @Prop({ default: false })
  used: boolean;

  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const CodeSchema = SchemaFactory.createForClass(Code);
CodeSchema.set('collection', 'Codes');
