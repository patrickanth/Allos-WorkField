import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { visualBoards } from '@/lib/firebase';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const board = await visualBoards.getById(params.id);
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    if (board.teamId !== session.user.teamId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error('Error fetching visual board:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const board = await visualBoards.getById(params.id);
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    if (board.teamId !== session.user.teamId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, nodes, edges } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (nodes !== undefined) updateData.nodes = nodes;
    if (edges !== undefined) updateData.edges = edges;

    if (updateData.name === '') {
      return NextResponse.json({ error: 'Board name cannot be empty' }, { status: 400 });
    }

    const updatedBoard = await visualBoards.update(params.id, updateData);

    return NextResponse.json(updatedBoard);
  } catch (error) {
    console.error('Error updating visual board:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const board = await visualBoards.getById(params.id);
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    if (board.teamId !== session.user.teamId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await visualBoards.delete(params.id);

    return NextResponse.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting visual board:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
