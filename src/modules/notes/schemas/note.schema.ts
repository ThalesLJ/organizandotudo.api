import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NoteDocument = Note & Document;

@Schema({ timestamps: true })
export class Note {
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop()
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const NoteSchema = SchemaFactory.createForClass(Note);

// Set collection name with capital first letter
NoteSchema.set('collection', 'Notes');
