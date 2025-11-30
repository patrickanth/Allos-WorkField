import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { users, teams } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, teamCode } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password e nome sono obbligatori' },
        { status: 400 }
      );
    }

    const existingUser = users.getByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email già registrata' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let teamId: string | undefined;

    if (teamCode) {
      const team = teams.getByInviteCode(teamCode.toUpperCase());
      if (!team) {
        return NextResponse.json(
          { error: 'Codice team non valido' },
          { status: 400 }
        );
      }
      teamId = team.id;
    }

    const newUser = users.create({
      email,
      password: hashedPassword,
      name,
      role: 'member',
      teamId: teamId ?? null,
      avatar: null,
    });

    return NextResponse.json({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      teamId: newUser.teamId,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Errore durante la registrazione' },
      { status: 500 }
    );
  }
}
