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
      .select(`
        *,
        creator:creator_id (
          id,
          full_name,
          email,
          avatar
        ),
        requester:requester_id (
          id,
          full_name,
          email,
          avatar
        ),
        assignee:assignee_id (
          id,
          full_name,
          email,
          avatar
        )
      `)
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (sessionUser.role === 'user' && ticket.creator_id !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: logs, error: logsError } = await supabaseAdmin
      .from('logs')
      .select('timestamp, user_name, action')
      .eq('ticket_id', id)
      .order('timestamp', { ascending: true });

    if (logsError) {
      console.error('Ticket logs GET Supabase Error:', logsError);
    }

    const formattedTicket = {
      ...ticket,
      creatorName: ticket.creator?.full_name || null,
      creatorAvatar: ticket.creator?.avatar || null,
      creatorEmail: ticket.creator?.email || null,
      assigneeName: ticket.assignee?.full_name || null,
      assigneeAvatar: ticket.assignee?.avatar || null,
      logs: (logs || []).map((log) => ({
        timestamp: log.timestamp,
        user: log.user_name,
        action: log.action,
      })),
    };

    return NextResponse.json(formattedTicket);
  } catch (error) {
    console.error('Ticket Details GET API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const now = new Date().toISOString();

    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (sessionUser.role === 'user' && ticket.creator_id !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = {
      updated_at: now,
    };

    const changeLog = [];
    let creatorEmail = null;
    let creatorName = null;

    if (ticket.creator_id && ticket.creator_id !== sessionUser.id) {
      const { data: creator } = await supabaseAdmin
        .from('users')
        .select('email, full_name')
        .eq('id', ticket.creator_id)
        .maybeSingle();

      if (creator) {
        creatorEmail = creator.email;
        creatorName = creator.full_name;
      }
    }

    if ('assigneeId' in body) {
      if (sessionUser.role === 'user') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const newAssigneeId = body.assigneeId || null;
      updates.assignee_id = newAssigneeId;

      let assigneeName = 'Unassigned';
      let logAction = 'Unassigned ticket';

      if (newAssigneeId) {
        const { data: assignee } = await supabaseAdmin
          .from('users')
          .select('full_name')
          .eq('id', newAssigneeId)
          .maybeSingle();

        if (assignee) {
          assigneeName = assignee.full_name;
          logAction = `Assigned ticket to ${assigneeName}`;
        }
      }

      await supabaseAdmin.from('logs').insert({
        ticket_id: id,
        user_name: sessionUser.full_name || sessionUser.email,
        action: logAction,
        timestamp: now,
      });

      if (newAssigneeId && newAssigneeId !== sessionUser.id) {
        await supabaseAdmin.from('notifications').insert({
          user_id: newAssigneeId,
          ticket_id: id,
          message: `Ticket ${displayTicketId(ticket)} has been assigned to you by ${sessionUser.full_name || sessionUser.email}`,
          is_urgent: false,
          read_status: false,
          timestamp: now,
        });
      }

      if (creatorEmail) {
        changeLog.push(`<strong>Assignee:</strong> changed to ${assigneeName}`);
      }
    }

    if ('status' in body) {
      const newStatus = body.status;
      updates.status = newStatus;

      const isClosedOrResolved =
        ticket.status === 'Closed' || ticket.status === 'Resolved';

      const isMovingToActive =
        newStatus === 'Open' || newStatus === 'In Progress';

      const logAction =
        isClosedOrResolved && isMovingToActive
          ? 'Reopened ticket'
          : `Updated status to ${newStatus}`;

      await supabaseAdmin.from('logs').insert({
        ticket_id: id,
        user_name: sessionUser.full_name || sessionUser.email,
        action: logAction,
        timestamp: now,
      });

      if (ticket.creator_id && ticket.creator_id !== sessionUser.id) {
        await supabaseAdmin.from('notifications').insert({
          user_id: ticket.creator_id,
          ticket_id: id,
          message: `Ticket ${displayTicketId(ticket)} status updated to ${newStatus} by ${sessionUser.full_name || sessionUser.email}`,
          is_urgent: false,
          read_status: false,
          timestamp: now,
        });
      }

      if (creatorEmail) {
        changeLog.push(`<strong>Status:</strong> updated to ${newStatus}`);
      }
    }

    if ('priority' in body) {
      if (sessionUser.role === 'user') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const newPriority = body.priority;
      updates.priority = newPriority;

      await supabaseAdmin.from('logs').insert({
        ticket_id: id,
        user_name: sessionUser.full_name || sessionUser.email,
        action: `Changed priority to ${newPriority}`,
        timestamp: now,
      });

      if (creatorEmail) {
        changeLog.push(`<strong>Priority:</strong> updated to ${newPriority}`);
      }
    }

    if ('rating' in body) {
      updates.rating = body.rating;
    }

    if ('feedback' in body) {
      updates.feedback = body.feedback;
    }

    if ('rating' in body || 'feedback' in body) {
      await supabaseAdmin.from('logs').insert({
        ticket_id: id,
        user_name: sessionUser.full_name || sessionUser.email,
        action: 'Submitted customer feedback and rating',
        timestamp: now,
      });
    }

    const updateKeys = Object.keys(updates).filter((key) => key !== 'updated_at');

    if (updateKeys.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('tickets')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      console.error('Ticket update Supabase Error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (creatorEmail && ticket.status !== 'Closed' && changeLog.length > 0) {
      try {
        await sendEmail({
          from: 'support@company.com',
          to: creatorEmail,
          subject: `Ticket Update Alert: [${displayTicketId(ticket)}]`,
          htmlContent: `
            <h2>Ticket Update Notification</h2>
            <p>Dear ${creatorName || 'User'},</p>
            <p>Your support ticket <strong>${displayTicketId(ticket)}</strong> has been updated by <strong>${sessionUser.full_name || sessionUser.email}</strong>.</p>
            <p>The following changes were made:</p>
            <ul>
              ${changeLog.map((change) => `<li>${change}</li>`).join('')}
            </ul>
            <hr/>
            <p>Please log in to the portal to view the details.</p>
          `,
        });
      } catch (emailError) {
        console.error('Ticket update email error:', emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ticket PATCH API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('ticket_id', id);

    await supabaseAdmin
      .from('logs')
      .delete()
      .eq('ticket_id', id);

    const { error } = await supabaseAdmin
      .from('tickets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Ticket DELETE Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ticket DELETE API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}