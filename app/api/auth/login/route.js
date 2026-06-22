import { get } from '@/lib/db.js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { usernameOrEmail, password } = await request.json();

    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { error: 'Username/Email and Password are required' },
        { status: 400 }
      );
    }

    const q = usernameOrEmail.toLowerCase().trim();
    
    // Fetch the user including their hashed password
    const user = await get(
      `SELECT id, username, password, name, role, email, employee_id AS employeeId, company, department, location, avatar 
       FROM users 
       WHERE LOWER(username) = ? OR LOWER(email) = ?`,
      [q, q]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username/email or password.' },
        { status: 401 }
      );
    }

    // Verify hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid username/email or password.' },
        { status: 401 }
      );
    }

    // Omit password from session cookie and response
    const { password: _, ...userSessionProfile } = user;

    // Set HTTP-only session cookie
    const cookieStore = await cookies();
    cookieStore.set('auratick_session', JSON.stringify(userSessionProfile), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return NextResponse.json({ success: true, user: userSessionProfile });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
