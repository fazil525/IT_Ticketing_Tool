import { query, run, get } from '@/lib/db.js';
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

export async function PATCH(request, { params }) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if target user exists
    const targetUser = await get('SELECT id FROM users WHERE id = ?', [id]);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Admins cannot change their own role to prevent lockout, but can edit other fields
    const updates = [];
    const dbParams = [];

    const fields = ['username', 'name', 'role', 'email', 'employeeId', 'company', 'department', 'location', 'avatar'];
    
    for (const field of fields) {
      if (field in body) {
        let value = body[field];
        if (field === 'username' || field === 'email') {
          value = value.toLowerCase().trim();
        }
        
        // Database column maps
        const colMap = {
          employeeId: 'employee_id'
        };
        const colName = colMap[field] || field;
        
        updates.push(`${colName} = ?`);
        dbParams.push(value);
      }
    }

    // Handle password reset
    if (body.password && body.password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      updates.push('password = ?');
      dbParams.push(hashedPassword);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    dbParams.push(id);
    await run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, dbParams);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User PATCH API Error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Username or Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Prevent admin from deleting themselves
    if (id === sessionUser.id) {
      return NextResponse.json({ error: 'You cannot delete your own administrative account' }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await get('SELECT id, name FROM users WHERE id = ?', [id]);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Clean up dependencies:
    // 1. Delete notifications related to this user
    await run('DELETE FROM notifications WHERE user_id = ?', [id]);

    // 2. Set assignee of tickets assigned to this user to NULL (unassigned)
    await run('UPDATE tickets SET assignee_id = NULL WHERE assignee_id = ?', [id]);

    // 3. Delete tickets created by this user
    await run('DELETE FROM tickets WHERE creator_id = ?', [id]);

    // 4. Finally delete the user
    await run('DELETE FROM users WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User DELETE API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
