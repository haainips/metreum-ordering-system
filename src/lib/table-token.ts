// src/lib/table-token.ts
import { createHmac, timingSafeEqual } from 'crypto';

const ALG = 'sha256';
const SEP = '.'; // pemisah antar bagian

type Payload = { tableId: string; exp: number }; // exp (epoch detik)

const b64u = (buf: Buffer | string) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const ub64u = (str: string) =>
  Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice((2 - (str.length * 3) % 4) % 4), 'base64');

const sign = (msg: string, secret: string) =>
  createHmac(ALG, secret).update(msg).digest();

export function createTableToken(tableId: string, ttlSeconds = 60 * 60 * 6) {
  const secret = process.env.TABLE_TOKEN_SECRET!;
  const payload: Payload = { tableId, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const body = b64u(Buffer.from(JSON.stringify(payload)));
  const sig = b64u(sign(body, secret));
  return `${body}${SEP}${sig}`;
}

export function verifyTableToken(token: string): Payload | null {
  try {
    const secret = process.env.TABLE_TOKEN_SECRET!;
    const [body, sig] = token.split(SEP);
    if (!body || !sig) return null;
    const expected = sign(body, secret);
    const given = ub64u(sig);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
    const payload = JSON.parse(ub64u(body).toString()) as Payload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
