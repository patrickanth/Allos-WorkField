import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { visualBoards } from '@/lib/firebase';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamBoards = await visualBoards.getByTeam(session.user.teamId);

    return NextResponse.json(teamBoards);
  } catch (error) {
    console.error('Error fetching visual boards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.teamId || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, nodes, edges } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Board name is required' }, { status: 400 });
    }

    const newBoard = await visualBoards.create({
      name: name.trim(),
      description: description?.trim() || null,
      nodes: nodes || [],
      edges: edges || [],
      teamId: session.user.teamId,
      authorId: session.user.id,
    });

    return NextResponse.json(newBoard, { status: 201 });
  } catch (error) {
    console.error('Error creating visual board:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
