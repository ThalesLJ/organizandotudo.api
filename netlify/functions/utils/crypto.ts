import crypto from 'crypto';

const secret = process.env.JWT_SECRET || '';
const algorithm = 'aes-256-cbc';
const keyLength = 32;
const ivLength = 16;

export const encryptData = (data: string): string => {
    if (!secret) {
        throw new Error('JWT_SECRET não configurado');
    }
    
    try {
        const key = crypto.scryptSync(secret, 'salt', keyLength);
        const iv = crypto.createHash('md5').update(data + secret).digest().slice(0, ivLength);
        
        const cipher = crypto.createCipher(algorithm, key);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const result = iv.toString('hex') + ':' + encrypted;
        return result;
    } catch (error) {
        throw new Error('Falha na criptografia dos dados');
    }
};

export const decryptData = (encryptedData: string): string => {
    if (!secret) {
        throw new Error('JWT_SECRET não configurado');
    }
    
    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 2) {
            throw new Error('Formato de dados criptografados inválido');
        }
        
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        
        const key = crypto.scryptSync(secret, 'salt', keyLength);
        const decipher = crypto.createDecipher(algorithm, key);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        throw new Error('Falha na descriptografia dos dados');
    }
};

export const testEncryption = (): boolean => {
    try {
        const testData = "test123";
        const encrypted1 = encryptData(testData);
        const encrypted2 = encryptData(testData);
        const decrypted1 = decryptData(encrypted1);
        const decrypted2 = decryptData(encrypted2);
        
        return encrypted1 === encrypted2 && decrypted1 === testData && decrypted2 === testData;
    } catch (error) {
        return false;
    }
}; 