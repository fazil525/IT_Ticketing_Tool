import { query, run } from '@/lib/db.js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

async function getSessionUser() {
  const cookieStore = await cookies();
  try {
    const session = cookieStore.get('auratick_session');
    if (!session) return null;
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const locations = await query('SELECT * FROM locations ORDER BY name ASC');
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Locations GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Location name is required' }, { status: 400 });
    }

    const cleanName = name.trim();
    const id = `loc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await run('INSERT INTO locations (id, name) VALUES (?, ?)', [id, cleanName]);
    return NextResponse.json({ success: true, location: { id, name: cleanName } });
  } catch (error) {
    console.error('Locations POST Error:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Location name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
