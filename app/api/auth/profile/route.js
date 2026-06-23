import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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

export async function POST(request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: sessionUser.email,
      password: currentPassword,
    });

    if (verifyError) {
      return NextResponse.json(
        { error: 'The current password you entered is incorrect.' },
        { status: 400 }
      );
    }

    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(sessionUser.id, {
        password: newPassword,
      });

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    console.error('Profile password API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}