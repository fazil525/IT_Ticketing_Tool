import { supabaseAdmin } from '@/lib/supabaseAdmin';
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

function displayTicketId(ticket) {
  return ticket.ticket_number || ticket.id;
}

export async function GET(request, { params }) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('id, creator_id')
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (sessionUser.role === 'user' && ticket.creator_id !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: chats, error: chatsError } = await supabaseAdmin
      .from('chats')
      .select(`
        *,
        sender:sender_id (
          id,
          full_name,
          avatar,
          role
        )
      `)
      .eq('ticket_id', id)
      .order('timestamp', { ascending: true });

    if (chatsError) {
      console.error('Chats GET Supabase Error:', chatsError);
      return NextResponse.json({ error: chatsError.message }, { status: 500 });
    }

    const formattedChats = (chats || []).map((chat) => ({
      ...chat,
      senderName: chat.sender?.full_name || null,
      senderAvatar: chat.sender?.avatar || null,
      senderRole: chat.sender?.role || null,
    }));

    return NextResponse.json(formattedChats);
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

    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('id, ticket_number, creator_id, assignee_id, status')
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (sessionUser.role === 'user' && ticket.creator_id !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date().toISOString();
    const cleanMessage = message.trim();
    const userName = sessionUser.full_name || sessionUser.email;

    const { error: chatInsertError } = await supabaseAdmin
      .from('chats')
      .insert({
        ticket_id: id,
        sender_id: sessionUser.id,
        message: cleanMessage,
        timestamp: now,
      });

    if (chatInsertError) {
      console.error('Chats insert Supabase Error:', chatInsertError);
      return NextResponse.json({ error: chatInsertError.message }, { status: 500 });
    }

    await supabaseAdmin.from('logs').insert({
      ticket_id: id,
      user_name: userName,
      action: 'Sent a message in support chat',
      timestamp: now,
    });

    if (ticket.status !== 'Closed') {
      if (sessionUser.id !== ticket.creator_id) {
        const { data: creator } = await supabaseAdmin
          .from('users')
          .select('email, full_name')
          .eq('id', ticket.creator_id)
          .maybeSingle();

        if (creator?.email) {
          try {
            await sendEmail({
              from: 'support@company.com',
              to: creator.email,
              subject: `[New Message] Support Reply for Ticket ${displayTicketId(ticket)}`,
              htmlContent: `
                <h2>New Message from IT Support</h2>
                <p>Dear ${creator.full_name || 'User'},</p>
                <p>An IT Support member (<strong>${userName}</strong>) has sent a new message regarding your ticket <strong>${displayTicketId(ticket)}</strong>:</p>
                <blockquote style="background-color: #f1f5f9; padding: 10px; border-left: 4px solid #6366f1; margin: 10px 0; color: #334155;">
                  <em>"${cleanMessage}"</em>
                </blockquote>
                <p>Please log in to the portal to view the details and reply.</p>
              `,
            });
          } catch (emailError) {
            console.error('Chat email to creator error:', emailError);
          }
        }
      } else if (ticket.assignee_id) {
        const { data: assignee } = await supabaseAdmin
          .from('users')
          .select('email, full_name')
          .eq('id', ticket.assignee_id)
          .maybeSingle();

        if (assignee?.email) {
          try {
            await sendEmail({
              from: 'support@company.com',
              to: assignee.email,
              subject: `[User Reply] - Ticket ${displayTicketId(ticket)}: Message from Requester`,
              htmlContent: `
                <h2>Requester Reply Alert</h2>
                <p>Dear ${assignee.full_name || 'User'},</p>
                <p>The ticket requester <strong>${userName}</strong> has sent a new chat message regarding ticket <strong>${displayTicketId(ticket)}</strong>:</p>
                <blockquote style="background-color: #f1f5f9; padding: 10px; border-left: 4px solid #6366f1; margin: 10px 0; color: #334155;">
                  <em>"${cleanMessage}"</em>
                </blockquote>
                <p>Please log in to the portal to view the chat and assist the employee.</p>
              `,
            });
          } catch (emailError) {
            console.error('Chat email to assignee error:', emailError);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chats POST API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}