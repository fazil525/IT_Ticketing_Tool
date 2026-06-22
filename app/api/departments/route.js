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
    const departments = await query('SELECT * FROM departments ORDER BY name ASC');
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Departments GET Error:', error);
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
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 });
    }

    const cleanName = name.trim();
    const id = `dept-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await run('INSERT INTO departments (id, name) VALUES (?, ?)', [id, cleanName]);
    return NextResponse.json({ success: true, department: { id, name: cleanName } });
  } catch (error) {
    console.error('Departments POST Error:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Department name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
