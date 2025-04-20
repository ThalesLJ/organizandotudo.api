import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export interface TokenPayload {
    userId: string;
    username: string;
    email: string;
}

export const generateToken = (payload: TokenPayload): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET não configurado');
    }
    return jwt.sign(payload, secret, { expiresIn: '24h' });
};

export const verifyToken = (token: string): TokenPayload => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET não configurado');
    }
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === 'string') {
        throw new Error('Token inválido');
    }
    return decoded as TokenPayload;
};

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

export const validateAuthorizationHeader = (handler: Handler): Handler => {
    return async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
        const authHeader = event.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    pt: { message: 'Token de autorização não fornecido', code: 'Unauthorized' },
                    en: { message: 'Authorization token not provided', code: 'Unauthorized' }
                })
            };
        }

        const token = authHeader.split(' ')[1];
        
        try {
            const decoded = verifyToken(token);
            event.headers.userId = decoded.userId;
            const response = await handler(event, context);
            return response || {
                statusCode: 200,
                body: ''
            };
        } catch (error) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    pt: { message: 'Token de autorização inválido', code: 'Unauthorized' },
                    en: { message: 'Invalid authorization token', code: 'Unauthorized' }
                })
            };
        }
    };
}; 