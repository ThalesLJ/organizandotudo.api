import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || '';

export const encryptData = (data: string): string => {
    const payload = { secure: data.toLowerCase() };
    const options = { 
        algorithm: 'HS512' as const,
        noTimestamp: true // Impede a inclusão automática do campo iat
    };
    return jwt.sign(payload, secret, options);
};

export const decryptData = (encryptedData: string): string => {
    try {
        const decoded = jwt.verify(encryptedData, secret);
        if (typeof decoded === 'string' || !decoded.secure) {
            throw new Error('Dados inválidos');
        }
        return decoded.secure;
    } catch (error) {
        console.error('Erro ao descriptografar:', error);
        throw error;
    }
}; 