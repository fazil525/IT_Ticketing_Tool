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
    const { data, error } = await supabaseAdmin
      .from('departments')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Departments GET Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Departments GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }

    const cleanName = name.trim();

    const { data, error } = await supabaseAdmin
      .from('departments')
      .insert({
        name: cleanName,
        description: description || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Departments POST Supabase Error:', error);

      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Department name already exists' },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      department: data,
    });
  } catch (error) {
    console.error('Departments POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}