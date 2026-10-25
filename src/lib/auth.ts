import { getIronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export type AdminSession = { adminId?: string };

const secret = process.env.SESSION_SECRET;

export const sessionOptions: SessionOptions = {
  password: secret && secret.length >= 32 ? secret : 'development-only-secret-at-least-32-chars-long',
  cookieName: 'sg_admin',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession() {
  if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) {
    throw new Error('SESSION_SECRET must be set to at least 32 characters in production.');
  }
  return getIronSession<AdminSession>(await cookies(), sessionOptions);
}

export async function requireAdmin() {
  const session = await getSession();
  return session.adminId ? session : null;
}
