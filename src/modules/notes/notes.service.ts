import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note } from './schemas/note.schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { EncryptionService } from '../common/services/encryption.service';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private noteModel: Model<Note>,
    private readonly encryptionService: EncryptionService,
  ) {}

  async create(userId: string, createNoteDto: CreateNoteDto): Promise<Note> {
    const { title, content, isPublic } = createNoteDto;

    const note = new this.noteModel({
      title: this.encryptionService.encrypt(title),
      content: this.encryptionService.encrypt(content),
      isPublic: isPublic || false,
      userId,
    });

    return note.save();
  }

  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: any = { 
      userId,
      deletedAt: { $exists: false } // Only non-deleted notes
    };

    if (search) {
      // For encrypted data, we need to search differently
      // This is a simplified approach - in production, you might want to use
      // a search index or implement a different search strategy
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const notes = await this.noteModel
      .find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.noteModel.countDocuments(query);

    // Decrypt notes for response
    const decryptedNotes = notes.map(note => ({
      id: note._id,
      title: this.encryptionService.decrypt(note.title),
      content: this.encryptionService.decrypt(note.content),
      isPublic: note.isPublic,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));

    return {
      notes: decryptedNotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const note = await this.noteModel.findOne({ 
      _id: id, 
      userId,
      deletedAt: { $exists: false } // Only non-deleted notes
    }).exec();
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return {
      id: note._id,
      title: this.encryptionService.decrypt(note.title),
      content: this.encryptionService.decrypt(note.content),
      isPublic: note.isPublic,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  async update(userId: string, id: string, updateNoteDto: UpdateNoteDto) {
    const note = await this.noteModel.findOne({ 
      _id: id, 
      userId,
      deletedAt: { $exists: false } // Only non-deleted notes
    }).exec();
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const updateData: any = { updatedAt: new Date() };

    if (updateNoteDto.title !== undefined) {
      updateData.title = this.encryptionService.encrypt(updateNoteDto.title);
    }

    if (updateNoteDto.content !== undefined) {
      updateData.content = this.encryptionService.encrypt(updateNoteDto.content);
    }

    if (updateNoteDto.isPublic !== undefined) {
      updateData.isPublic = updateNoteDto.isPublic;
    }

    const updatedNote = await this.noteModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    return {
      message: 'Note updated successfully',
      note: {
        id: updatedNote._id,
        title: this.encryptionService.decrypt(updatedNote.title),
        content: this.encryptionService.decrypt(updatedNote.content),
        isPublic: updatedNote.isPublic,
        updatedAt: updatedNote.updatedAt,
      },
    };
  }

  async remove(userId: string, id: string) {
    const note = await this.noteModel.findOne({ 
      _id: id, 
      userId,
      deletedAt: { $exists: false } // Only non-deleted notes
    }).exec();
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Soft delete - set deletedAt timestamp
    await this.noteModel.findByIdAndUpdate(id, {
      deletedAt: new Date(),
      updatedAt: new Date()
    }).exec();
    
    return { message: 'Note deleted successfully' };
  }

  async togglePublic(userId: string, id: string) {
    const note = await this.noteModel.findOne({ 
      _id: id, 
      userId,
      deletedAt: { $exists: false } // Only non-deleted notes
    }).exec();
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const updatedNote = await this.noteModel
      .findByIdAndUpdate(
        id,
        { isPublic: !note.isPublic, updatedAt: new Date() },
        { new: true },
      )
      .exec();

    return {
      message: 'Note public status toggled successfully',
      note: {
        id: updatedNote._id,
        title: this.encryptionService.decrypt(updatedNote.title),
        content: this.encryptionService.decrypt(updatedNote.content),
        isPublic: updatedNote.isPublic,
        updatedAt: updatedNote.updatedAt,
      },
    };
  }
}
