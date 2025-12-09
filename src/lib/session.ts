import { cookies } from 'next/headers';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('allos-session');

    if (!sessionCookie?.value) {
      return null;
    }

    const userData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString());
    return userData as SessionUser;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('allos-session');
}
