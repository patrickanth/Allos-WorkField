import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { notes, users } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'private' | 'shared' | 'all'

    let result: Awaited<ReturnType<typeof notes.getAll>>;

    if (type === 'private') {
      result = await notes.getPrivateByAuthor(session.user.id);
    } else if (type === 'shared' && session.user.teamId) {
      result = await notes.getByTeam(session.user.teamId);
    } else {
      // Get all notes for current user (private + shared from team)
      const privateNotes = await notes.getPrivateByAuthor(session.user.id);
      const sharedNotes = session.user.teamId
        ? await notes.getByTeam(session.user.teamId)
        : [];
      result = [...privateNotes, ...sharedNotes];
    }

    // Add author info
    const notesWithAuthors = await Promise.all(result.map(async note => {
      const author = await users.getById(note.authorId);
      return {
        ...note,
        author: author ? { id: author.id, name: author.name, avatar: author.avatar } : null,
      };
    }));

    // Sort by timestamp desc
    notesWithAuthors.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json(notesWithAuthors);
  } catch (error) {
    console.error('Get notes error:', error);
    return NextResponse.json({ error: 'Errore nel recupero delle note' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { content, isPrivate } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Il contenuto è obbligatorio' }, { status: 400 });
    }

    const newNote = await notes.create({
      content: content.trim(),
      isPrivate: isPrivate ?? true,
      authorId: session.user.id,
      teamId: !isPrivate && session.user.teamId ? session.user.teamId : null,
    });

    const author = await users.getById(session.user.id);

    return NextResponse.json({
      ...newNote,
      author: author ? { id: author.id, name: author.name, avatar: author.avatar } : null,
    });
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json({ error: 'Errore nella creazione della nota' }, { status: 500 });
  }
}
