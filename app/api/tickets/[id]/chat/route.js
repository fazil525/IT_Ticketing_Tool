import { get, query, run } from '@/lib/db.js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer.js';

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

export async function GET(request, { params }) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch ticket to check access control
    const ticket = await get(`SELECT creator_id FROM tickets WHERE id = ?`, [id]);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (sessionUser.role === 'user' && ticket.creator_id !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const chats = await query(
      `SELECT c.*, u.name AS senderName, u.avatar AS senderAvatar, u.role AS senderRole
       FROM chats c
       LEFT JOIN users u ON c.sender_id = u.id
       WHERE c.ticket_id = ?
       ORDER BY c.timestamp ASC`,
      [id]
    );

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Chats GET API Error:', error);
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
    const { message } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    // Fetch ticket to check access and get assignee / creator info
    const ticket = await get(`SELECT * FROM tickets WHERE id = ?`, [id]);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (sessionUser.role === 'user' && ticket.creator_id !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date().toISOString();
    const messageId = `msg-${Date.now()}`;

    // 1. Insert original user message
    await run(
      `INSERT INTO chats (id, ticket_id, sender_id, message, timestamp)
       VALUES (?, ?, ?, ?, ?)`,
      [messageId, id, sessionUser.id, message, now]
    );

    // 2. Insert audit log for message sent
    await run(
      `INSERT INTO logs (ticket_id, user_name, action, timestamp)
       VALUES (?, ?, ?, ?)`,
      [id, sessionUser.name, 'Sent a message in support chat', now]
    );

    // 3. Send email notifications if the ticket is not closed
    if (ticket.status !== 'Closed') {
      if (sessionUser.id !== ticket.creator_id) {
        // Reply from IT Staff member (technician or admin) to standard user (creator)
        const creator = await get(`SELECT email, name FROM users WHERE id = ?`, [ticket.creator_id]);
        if (creator && creator.email) {
          await sendEmail({
            from: 'support@company.com',
            to: creator.email,
            subject: `[New Message] Support Reply for Ticket ${id}`,
            htmlContent: `
              <h2>New Message from IT Support</h2>
              <p>Dear ${creator.name},</p>
              <p>An IT Support member (<strong>${sessionUser.name}</strong>) has sent a new message regarding your ticket <strong>${id}</strong>:</p>
              <blockquote style="background-color: #f1f5f9; padding: 10px; border-left: 4px solid #6366f1; margin: 10px 0; color: #334155;">
                <em>"${message.trim()}"</em>
              </blockquote>
              <p>Please log in to the portal to view the details and reply.</p>
            `
          });
        }
      } else if (ticket.assignee_id) {
        // Reply from standard user (creator) to assigned IT staff member
        const assignee = await get(`SELECT email, name FROM users WHERE id = ?`, [ticket.assignee_id]);
        if (assignee && assignee.email) {
          await sendEmail({
            from: 'support@company.com',
            to: assignee.email,
            subject: `[User Reply] - Ticket ${id}: Message from Requester`,
            htmlContent: `
              <h2>Requester Reply Alert</h2>
              <p>Dear ${assignee.name},</p>
              <p>The ticket requester <strong>${sessionUser.name}</strong> has sent a new chat message regarding ticket <strong>${id}</strong>:</p>
              <blockquote style="background-color: #f1f5f9; padding: 10px; border-left: 4px solid #6366f1; margin: 10px 0; color: #334155;">
                <em>"${message.trim()}"</em>
              </blockquote>
              <p>Please log in to the portal to view the chat and assist the employee.</p>
            `
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chats POST API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
