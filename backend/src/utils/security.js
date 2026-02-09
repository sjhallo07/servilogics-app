import crypto from 'crypto';

const HASH_PREFIX = 'scrypt';

const base64UrlEncode = (input) => {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer
    .toString('base64')
    .replace(/=+$/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const parseExpiry = (value) => {
  if (!value) return 24 * 60 * 60;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const match = String(value).trim().match(/^(\d+)([smhd])?$/i);
  if (!match) return 24 * 60 * 60;
  const amount = Number(match[1]);
  const unit = (match[2] || 's').toLowerCase();
  switch (unit) {
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 60 * 60 * 24;
    default:
      return amount;
  }
};

export const isHashedPassword = (value = '') => String(value).startsWith(`${HASH_PREFIX}$`);

export async function hashPassword(plain) {
  const salt = crypto.randomBytes(16);
  const hash = await new Promise((resolve, reject) => {
    crypto.scrypt(plain, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      return resolve(derivedKey);
    });
  });

  return `${HASH_PREFIX}$${base64UrlEncode(salt)}$${base64UrlEncode(hash)}`;
}

export async function verifyPassword(plain, stored) {
  if (!isHashedPassword(stored)) return false;
  const [, saltEncoded, hashEncoded] = String(stored).split('$');
  if (!saltEncoded || !hashEncoded) return false;

  const salt = Buffer.from(saltEncoded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  const expected = Buffer.from(hashEncoded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

  const derived = await new Promise((resolve, reject) => {
    crypto.scrypt(plain, salt, expected.length, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      return resolve(derivedKey);
    });
  });

  return crypto.timingSafeEqual(expected, derived);
}

export function signJwt(payload, secret, expiresIn) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + parseExpiry(expiresIn);
  const body = { ...payload, iat: now, exp };

  const headerPart = base64UrlEncode(JSON.stringify(header));
  const payloadPart = base64UrlEncode(JSON.stringify(body));
  const data = `${headerPart}.${payloadPart}`;
  const signature = base64UrlEncode(
    crypto.createHmac('sha256', secret).update(data).digest(),
  );

  return `${data}.${signature}`;
}
