import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_EMAIL = 'patrickanthonystudio@gmail.com';
const ADMIN_PASSWORD = 'dev123@@';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Hardcoded admin check
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const user = {
        id: 'admin-patrick',
        email: ADMIN_EMAIL,
        name: 'Patrick',
        role: 'admin',
      };

      // Set session cookie with user data (base64 encoded)
      const sessionData = Buffer.from(JSON.stringify(user)).toString('base64');

      const cookieStore = await cookies();
      cookieStore.set('allos-session', sessionData, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });

      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ success: false, error: 'Credenziali non valide' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: 'Errore del server' }, { status: 500 });
  }
}
