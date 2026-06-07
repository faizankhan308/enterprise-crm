import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-crm-jwt-token-secret-2026';

function base64encode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64decode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export function signJwt(payload, expiresInMinutes = 240) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerEncoded = base64encode(JSON.stringify(header));
  
  const extPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (expiresInMinutes * 60)
  };
  const payloadEncoded = base64encode(JSON.stringify(extPayload));
  
  const signatureInput = `${headerEncoded}.${payloadEncoded}`;
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    
  return `${signatureInput}.${signature}`;
}

export function verifyJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [headerEncoded, payloadEncoded, signature] = parts;
    
    const signatureInput = `${headerEncoded}.${payloadEncoded}`;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(signatureInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
      
    if (signature !== expectedSignature) {
      return null;
    }
    
    const payload = JSON.parse(base64decode(payloadEncoded));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Expired
    }
    
    return payload;
  } catch (e) {
    return null;
  }
}

export function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}
