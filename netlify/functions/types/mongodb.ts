import { ObjectId } from 'mongodb';

export interface UserDocument {
    _id?: ObjectId;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface NoteDocument {
    _id?: ObjectId;
    userId: ObjectId;
    title: string;
    content: string;
    isPublic: boolean;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
} 