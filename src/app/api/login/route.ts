import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email || 'patrickanthonystudio@gmail.com';

    // SEMPRE entra - nessun controllo password
    const user = {
      id: 'admin-patrick',
      email: email,
      name: 'Patrick',
      role: 'admin',
    };

    const sessionData = Buffer.from(JSON.stringify(user)).toString('base64');

    const cookieStore = await cookies();
    cookieStore.set('allos-session', sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json({ success: true, user: { id: 'admin', name: 'Patrick', role: 'admin' } });
  }
}
