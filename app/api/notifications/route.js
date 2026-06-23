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

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', sessionUser.id)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Notifications GET Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Notifications GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { id } = body;

    let updateQuery = supabaseAdmin
      .from('notifications')
      .update({ read_status: true })
      .eq('user_id', sessionUser.id);

    if (id) {
      updateQuery = updateQuery.eq('id', id);
    }

    const { error } = await updateQuery;

    if (error) {
      console.error('Notifications POST Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notifications POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}