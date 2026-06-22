import { get } from '@/lib/db.js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

async function getSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('auratick_session');
  if (!session) return null;
  try {
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

    const userId = sessionUser.id;
    // Recent is defined as created in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

    // Global Stats - filtered by creator_id if standard user
    let globalAll, globalRecent, globalActive, globalSuspended, globalClosed;
    if (sessionUser.role === 'user') {
      globalAll = await get(`SELECT COUNT(*) as count FROM tickets WHERE creator_id = ?`, [userId]);
      globalRecent = await get(`SELECT COUNT(*) as count FROM tickets WHERE creator_id = ? AND created_at >= ?`, [userId, sevenDaysAgo]);
      globalActive = await get(`SELECT COUNT(*) as count FROM tickets WHERE creator_id = ? AND status IN ('Open', 'In Progress')`, [userId]);
      globalSuspended = await get(`SELECT COUNT(*) as count FROM tickets WHERE creator_id = ? AND status = 'Suspended'`, [userId]);
      globalClosed = await get(`SELECT COUNT(*) as count FROM tickets WHERE creator_id = ? AND status IN ('Closed', 'Resolved')`, [userId]);
    } else {
      globalAll = await get(`SELECT COUNT(*) as count FROM tickets`);
      globalRecent = await get(`SELECT COUNT(*) as count FROM tickets WHERE created_at >= ?`, [sevenDaysAgo]);
      globalActive = await get(`SELECT COUNT(*) as count FROM tickets WHERE status IN ('Open', 'In Progress')`);
      globalSuspended = await get(`SELECT COUNT(*) as count FROM tickets WHERE status = 'Suspended'`);
      globalClosed = await get(`SELECT COUNT(*) as count FROM tickets WHERE status IN ('Closed', 'Resolved')`);
    }

    // Self Stats
    const selfAll = await get(`SELECT COUNT(*) as count FROM tickets WHERE assignee_id = ?`, [userId]);
    const selfActive = await get(`SELECT COUNT(*) as count FROM tickets WHERE assignee_id = ? AND status IN ('Open', 'In Progress')`, [userId]);
    const selfClosed = await get(`SELECT COUNT(*) as count FROM tickets WHERE assignee_id = ? AND status IN ('Closed', 'Resolved')`, [userId]);
    const selfSuspended = await get(`SELECT COUNT(*) as count FROM tickets WHERE assignee_id = ? AND status = 'Suspended'`, [userId]);

    return NextResponse.json({
      global: {
        all: globalAll.count || 0,
        recent: globalRecent.count || 0,
        active: globalActive.count || 0,
        suspended: globalSuspended.count || 0,
        closed: globalClosed.count || 0
      },
      self: {
        all: selfAll.count || 0,
        active: selfActive.count || 0,
        closed: selfClosed.count || 0,
        suspended: selfSuspended.count || 0
      }
    });
  } catch (error) {
    console.error('Stats GET API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
