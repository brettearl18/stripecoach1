import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-fallback-encryption-key-min-32-chars!!';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

export function encrypt(text: string): string {
  // Generate a random salt
  const salt = crypto.randomBytes(SALT_LENGTH);
  
  // Create a key using the salt
  const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, 'sha256');
  
  // Generate a random IV
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get the auth tag
  const tag = cipher.getAuthTag();
  
  // Combine the salt, IV, tag, and encrypted text
  const result = salt.toString('hex') + 
                iv.toString('hex') + 
                tag.toString('hex') + 
                encrypted;
  
  return result;
}

export function decrypt(encryptedData: string): string {
  // Extract the salt, IV, tag and encrypted text
  const salt = Buffer.from(encryptedData.slice(0, SALT_LENGTH * 2), 'hex');
  const iv = Buffer.from(encryptedData.slice(SALT_LENGTH * 2, (SALT_LENGTH + IV_LENGTH) * 2), 'hex');
  const tag = Buffer.from(encryptedData.slice((SALT_LENGTH + IV_LENGTH) * 2, (SALT_LENGTH + IV_LENGTH + TAG_LENGTH) * 2), 'hex');
  const encrypted = encryptedData.slice((SALT_LENGTH + IV_LENGTH + TAG_LENGTH) * 2);
  
  // Recreate the key using the salt
  const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, 'sha256');
  
  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  // Decrypt the text
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
} 