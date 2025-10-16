import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Setting extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  value: string;

  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
SettingSchema.set('collection', 'Settings');
