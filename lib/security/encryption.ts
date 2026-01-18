/**
 * API Key Encryption Utilities
 * Uses AES-256-GCM for secure API key storage
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

if (!process.env.ENCRYPTION_KEY) {
    console.warn('⚠️  ENCRYPTION_KEY not set in .env - using random key (not persistent!)');
}

interface EncryptedData {
    iv: string;
    encryptedData: string;
    authTag: string;
}

/**
 * Encrypt sensitive data (API keys, secrets)
 */
export function encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        ALGORITHM,
        Buffer.from(ENCRYPTION_KEY, 'hex'),
        iv
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    const result: EncryptedData = {
        iv: iv.toString('hex'),
        encryptedData: encrypted,
        authTag: authTag.toString('hex'),
    };

    return JSON.stringify(result);
}

/**
 * Decrypt encrypted data
 */
export function decrypt(encryptedText: string): string {
    try {
        const { iv, encryptedData, authTag }: EncryptedData = JSON.parse(encryptedText);

        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            Buffer.from(ENCRYPTION_KEY, 'hex'),
            Buffer.from(iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(authTag, 'hex'));

        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        throw new Error('Decryption failed - invalid key or corrupted data');
    }
}

/**
 * Hash API key for comparison (one-way)
 */
export function hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Generate secure API key
 */
export function generateApiKey(): string {
    return `crytonix_${crypto.randomBytes(32).toString('hex')}`;
}
