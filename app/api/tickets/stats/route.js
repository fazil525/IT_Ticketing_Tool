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

async function countTickets(filters = {}) {
  let query = supabaseAdmin
    .from('tickets')
    .select('id', { count: 'exact', head: true });

  if (filters.creator_id) {
    query = query.eq('creator_id', filters.creator_id);
  }

  if (filters.assignee_id) {
    query = query.eq('assignee_id', filters.assignee_id);
  }

  if (filters.created_after) {
    query = query.gte('created_at', filters.created_after);
  }

  if (filters.statuses) {
    query = query.in('status', filters.statuses);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count || 0;
}

export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = sessionUser.id;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

    const userFilter =
      sessionUser.role === 'user'
        ? { creator_id: userId }
        : {};

    const [
      globalAll,
      globalRecent,
      globalActive,
      globalSuspended,
      globalClosed,
      selfAll,
      selfActive,
      selfClosed,
      selfSuspended,
    ] = await Promise.all([
      countTickets(userFilter),
      countTickets({ ...userFilter, created_after: sevenDaysAgo }),
      countTickets({ ...userFilter, statuses: ['Open', 'In Progress'] }),
      countTickets({ ...userFilter, status: 'Suspended' }),
      countTickets({ ...userFilter, statuses: ['Closed', 'Resolved'] }),

      countTickets({ assignee_id: userId }),
      countTickets({ assignee_id: userId, statuses: ['Open', 'In Progress'] }),
      countTickets({ assignee_id: userId, statuses: ['Closed', 'Resolved'] }),
      countTickets({ assignee_id: userId, status: 'Suspended' }),
    ]);

    return NextResponse.json({
      global: {
        all: globalAll,
        recent: globalRecent,
        active: globalActive,
        suspended: globalSuspended,
        closed: globalClosed,
      },
      self: {
        all: selfAll,
        active: selfActive,
        closed: selfClosed,
        suspended: selfSuspended,
      },
    });
  } catch (error) {
    console.error('Stats GET API Error:', error);

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}