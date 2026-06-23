import { supabaseAdmin } from '@/lib/supabaseAdmin';
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

    let queryBuilder = supabaseAdmin
      .from('emails')
      .select('*')
      .order('timestamp', { ascending: false });

    if (sessionUser.role !== 'admin' && sessionUser.role !== 'technician') {
      queryBuilder = queryBuilder.eq('to_email', sessionUser.email);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Emails GET Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Emails GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}