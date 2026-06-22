import { query, run } from '@/lib/db.js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

async function getSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('auratick_session');
  if (!session) return null;
  try {
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await query(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY timestamp DESC`,
      [sessionUser.id]
    );

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Notifications GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      // Body might be empty
    }

    const { id } = body;

    if (id) {
      await run(
        `UPDATE notifications 
         SET read_status = 1 
         WHERE id = ? AND user_id = ?`,
        [id, sessionUser.id]
      );
    } else {
      await run(
        `UPDATE notifications 
         SET read_status = 1 
         WHERE user_id = ?`,
        [sessionUser.id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notifications POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
