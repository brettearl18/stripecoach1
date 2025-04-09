export function generateInviteToken(): string {
  // Generate a random token using browser's crypto API
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
} 