import { query } from '@/lib/db.js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('auratick_session');
    if (!session) return null;
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

    let emails = [];
    if (sessionUser.role === 'admin' || sessionUser.role === 'technician') {
      // Admins and techs see all outbound logs
      emails = await query(`SELECT * FROM emails ORDER BY timestamp DESC`);
    } else {
      // Standard users only see simulated emails sent to them
      emails = await query(
        `SELECT * FROM emails 
         WHERE to_email = ? 
         ORDER BY timestamp DESC`,
        [sessionUser.email]
      );
    }

    return NextResponse.json(emails);
  } catch (error) {
    console.error('Emails GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
