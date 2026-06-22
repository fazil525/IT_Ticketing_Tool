import { query, run, get } from '@/lib/db.js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer.js';

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

export async function GET(request, { params }) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ticket exists
    const ticket = await get('SELECT id FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const notes = await query(
      'SELECT * FROM ticket_notes WHERE ticket_id = ? ORDER BY timestamp ASC',
      [id]
    );

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Notes GET API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { note } = await request.json();

    if (!note || !note.trim()) {
      return NextResponse.json({ error: 'Note content is required' }, { status: 400 });
    }

    // Verify ticket exists
    const ticket = await get('SELECT id, creator_id, status FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const cleanNote = note.trim();

    // Insert fix note
    await run(
      'INSERT INTO ticket_notes (ticket_id, user_name, note, timestamp) VALUES (?, ?, ?, ?)',
      [id, sessionUser.name, cleanNote, now]
    );

    // Log in audit log
    const logSnippet = cleanNote.length > 60 ? cleanNote.slice(0, 60) + '...' : cleanNote;
    await run(
      'INSERT INTO logs (ticket_id, user_name, action, timestamp) VALUES (?, ?, ?, ?)',
      [id, sessionUser.name, `Added fix note: "${logSnippet}"`, now]
    );

    // Send email alert to creator if ticket is not closed
    if (ticket.status !== 'Closed' && sessionUser.id !== ticket.creator_id) {
      const creator = await get(`SELECT email, name FROM users WHERE id = ?`, [ticket.creator_id]);
      if (creator && creator.email) {
        await sendEmail({
          from: 'support@company.com',
          to: creator.email,
          subject: `[Technical Update] Fix Note Added to Ticket ${id}`,
          htmlContent: `
            <h2>New Technical Note Added</h2>
            <p>Dear ${creator.name},</p>
            <p>An IT staff member (<strong>${sessionUser.name}</strong>) has added a technical note to your ticket <strong>${id}</strong>:</p>
            <blockquote style="background-color: #f1f5f9; padding: 10px; border-left: 4px solid #6366f1; margin: 10px 0; color: #334155;">
              <em>"${cleanNote}"</em>
            </blockquote>
            <p>Please log in to the portal to view your ticket logs and chat history.</p>
          `
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      note: { 
        ticket_id: id, 
        user_name: sessionUser.name, 
        note: cleanNote, 
        timestamp: now 
      } 
    });
  } catch (error) {
    console.error('Notes POST API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
