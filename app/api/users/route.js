import { query, run } from '@/lib/db.js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

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
    console.log('GET /api/users - Session User:', sessionUser);

    if (!sessionUser || (sessionUser.role !== 'admin' && sessionUser.role !== 'technician')) {
      console.log('GET /api/users - Forbidden: User role is not admin or technician');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await query(`
      SELECT id, username, name, role, email, employee_id AS employeeId, company, department, location, avatar 
      FROM users
    `);
    console.log('GET /api/users - Successfully retrieved users. Count:', users.length);
    return NextResponse.json(users);
  } catch (error) {
    console.error('Users GET API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { username, password, name, role, email, employeeId, company, department, location, avatar } = await request.json();

    if (!username || !password || !name || !role || !email) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    const newId = `user-${Date.now()}`;
    const defaultAvatar = avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`;

    const hashedPassword = await bcrypt.hash(password, 10);

    await run(
      `INSERT INTO users (id, username, password, name, role, email, employee_id, company, department, location, avatar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newId, username.toLowerCase().trim(), hashedPassword, name, role, email.toLowerCase().trim(), employeeId || '', company || '', department || '', location || 'Abu Dhabi (HQ)', defaultAvatar]
    );

    const createdUser = {
      id: newId,
      username,
      name,
      role,
      email,
      employeeId,
      company,
      department,
      location: location || 'Abu Dhabi (HQ)',
      avatar: defaultAvatar
    };

    return NextResponse.json({ success: true, user: createdUser });
  } catch (error) {
    console.error('Users POST API Error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Username or Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
