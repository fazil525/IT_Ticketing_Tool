import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { get } from '@/lib/db.js';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('auratick_session');

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = JSON.parse(session.value);
    
    // Validate that the user actually exists in the database
    const dbUser = await get('SELECT id FROM users WHERE id = ?', [user.id]);
    if (!dbUser) {
      const response = NextResponse.json({ authenticated: false }, { status: 401 });
      response.cookies.delete('auratick_session');
      return response;
    }

    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    // Attempt to clear cookie on parsing errors
    try {
      const cookieStore = await cookies();
      cookieStore.delete('auratick_session');
    } catch (e) {}
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
