import { supabaseAdmin } from '@/lib/supabaseAdmin';
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

    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('id')
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const { data: notes, error } = await supabaseAdmin
      .from('ticket_notes')
      .select('*')
      .eq('ticket_id', id)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Notes GET Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(notes || []);
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

    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('id, creator_id, status, ticket_number')
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const cleanNote = note.trim();
    const userName = sessionUser.full_name || sessionUser.email;

    const { data: insertedNote, error: insertError } = await supabaseAdmin
      .from('ticket_notes')
      .insert({
        ticket_id: id,
        user_name: userName,
        note: cleanNote,
        timestamp: now,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Notes insert Supabase Error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const logSnippet =
      cleanNote.length > 60 ? `${cleanNote.slice(0, 60)}...` : cleanNote;

    await supabaseAdmin.from('logs').insert({
      ticket_id: id,
      user_name: userName,
      action: `Added fix note: "${logSnippet}"`,
      timestamp: now,
    });

    if (ticket.status !== 'Closed' && sessionUser.id !== ticket.creator_id) {
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
            subject: `[Technical Update] Fix Note Added to Ticket ${ticket.ticket_number || id}`,
            htmlContent: `
              <h2>New Technical Note Added</h2>
              <p>Dear ${creator.full_name || 'User'},</p>
              <p>An IT staff member (<strong>${userName}</strong>) has added a technical note to your ticket <strong>${ticket.ticket_number || id}</strong>:</p>
              <blockquote style="background-color: #f1f5f9; padding: 10px; border-left: 4px solid #6366f1; margin: 10px 0; color: #334155;">
                <em>"${cleanNote}"</em>
              </blockquote>
              <p>Please log in to the portal to view your ticket logs and chat history.</p>
            `,
          });
        } catch (emailError) {
          console.error('Note email error:', emailError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      note: insertedNote,
    });
  } catch (error) {
    console.error('Notes POST API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}