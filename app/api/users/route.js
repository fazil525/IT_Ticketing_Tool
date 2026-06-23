import { supabaseAdmin } from '@/lib/supabaseAdmin';
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
    const sessionUser = await getSessionUser();

    if (
      !sessionUser ||
      (sessionUser.role !== 'admin' && sessionUser.role !== 'technician')
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        username,
        full_name,
        role,
        email,
        employee_id,
        company,
        department,
        location,
        avatar,
        is_active,
        created_at
      `)
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Users GET Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const users = (data || []).map((user) => ({
      id: user.id,
      username: user.username,
      name: user.full_name,
      role: user.role,
      email: user.email,
      employeeId: user.employee_id,
      company: user.company,
      department: user.department,
      location: user.location,
      avatar: user.avatar,
      isActive: user.is_active,
      createdAt: user.created_at,
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error('Users GET API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const {
      username,
      password,
      name,
      role,
      email,
      employeeId,
      company,
      department,
      location,
      avatar,
    } = await request.json();

    if (!password || !name || !role || !email) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername =
      username?.toLowerCase().trim() || cleanEmail.split('@')[0];

    const defaultAvatar =
      avatar ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          username: cleanUsername,
          role,
        },
      });

    if (authError) {
      console.error('Supabase Auth create user error:', authError);

      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        username: cleanUsername,
        full_name: name,
        role,
        email: cleanEmail,
        employee_id: employeeId || null,
        company: company || null,
        department: department || null,
        location: location || 'Abu Dhabi (HQ)',
        avatar: defaultAvatar,
        is_active: true,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Users profile insert error:', profileError);

      // Cleanup auth user if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      if (profileError.code === '23505') {
        return NextResponse.json(
          { error: 'Username or Email already exists' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        username: profile.username,
        name: profile.full_name,
        role: profile.role,
        email: profile.email,
        employeeId: profile.employee_id,
        company: profile.company,
        department: profile.department,
        location: profile.location,
        avatar: profile.avatar,
      },
    });
  } catch (error) {
    console.error('Users POST API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}