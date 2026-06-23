import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let queryBuilder = supabaseAdmin
      .from('faqs')
      .select('id, category, title, summary, content')
      .order('category', { ascending: true });

    if (category && category !== 'All') {
      queryBuilder = queryBuilder.eq('category', category);
    }

    if (search) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${search}%,summary.ilike.%${search}%,content.ilike.%${search}%`
      );
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('FAQ Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('FAQ API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}