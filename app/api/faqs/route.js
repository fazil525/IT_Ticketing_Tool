import { query } from '@/lib/db.js';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let sql = 'SELECT id, category, title, summary, content FROM faqs';
    const params = [];
    const conditions = [];

    if (category && category !== 'All') {
      conditions.push('category = ?');
      params.push(category);
    }

    if (search) {
      conditions.push('(title LIKE ? OR summary LIKE ? OR content LIKE ?)');
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const faqs = await query(sql, params);
    return NextResponse.json(faqs);
  } catch (error) {
    console.error('FAQ API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
