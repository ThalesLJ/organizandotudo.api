import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || '';
const client = new MongoClient(uri);

export const connectToDatabase = async () => {
    try {
        await client.connect();
        const db = client.db(process.env.MONGODB_DATABASE || '');
        return {
            users: db.collection(process.env.MONGODB_COLLECTION_USERS || ''),
            notes: db.collection(process.env.MONGODB_COLLECTION_NOTES || '')
        };
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
        throw error;
    }
};

export const closeConnection = async () => {
    try {
        await client.close();
    } catch (error) {
        console.error('Erro ao fechar conexão com o MongoDB:', error);
        throw error;
    }
}; 