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

export async function PATCH(request, { params }) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const { data: targetUser, error: findError } = await supabaseAdmin
      .from('users')
      .select('id,email')
      .eq('id', id)
      .single();

    if (findError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updates = {};

    if ('username' in body) updates.username = body.username?.toLowerCase().trim();
    if ('name' in body) updates.full_name = body.name;
    if ('email' in body) updates.email = body.email?.toLowerCase().trim();
    if ('employeeId' in body) updates.employee_id = body.employeeId;
    if ('company' in body) updates.company = body.company;
    if ('department' in body) updates.department = body.department;
    if ('location' in body) updates.location = body.location;
    if ('avatar' in body) updates.avatar = body.avatar;

    if ('role' in body) {
      if (id === sessionUser.id && body.role !== sessionUser.role) {
        return NextResponse.json(
          { error: 'You cannot change your own admin role' },
          { status: 400 }
        );
      }

      updates.role = body.role;
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateProfileError } = await supabaseAdmin
        .from('users')
        .update(updates)
        .eq('id', id);

      if (updateProfileError) {
        if (updateProfileError.code === '23505') {
          return NextResponse.json(
            { error: 'Username or Email already exists' },
            { status: 400 }
          );
        }

        return NextResponse.json(
          { error: updateProfileError.message },
          { status: 500 }
        );
      }
    }

    if (body.password && body.password.trim() !== '') {
      const { error: passwordError } =
        await supabaseAdmin.auth.admin.updateUserById(id, {
          password: body.password,
        });

      if (passwordError) {
        return NextResponse.json(
          { error: passwordError.message },
          { status: 500 }
        );
      }
    }

    if ('email' in body) {
      const { error: authEmailError } =
        await supabaseAdmin.auth.admin.updateUserById(id, {
          email: body.email?.toLowerCase().trim(),
          email_confirm: true,
        });

      if (authEmailError) {
        return NextResponse.json(
          { error: authEmailError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User PATCH API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    if (id === sessionUser.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own administrative account' },
        { status: 400 }
      );
    }

    const { data: targetUser, error: findError } = await supabaseAdmin
      .from('users')
      .select('id,full_name,email')
      .eq('id', id)
      .single();

    if (findError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('user_id', id);

    await supabaseAdmin
      .from('tickets')
      .update({ assignee_id: null })
      .eq('assignee_id', id);

    await supabaseAdmin
      .from('tickets')
      .delete()
      .eq('creator_id', id);

    await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    await supabaseAdmin.auth.admin.deleteUser(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User DELETE API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}