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

function getSlaDue(priority) {
  const createdAt = new Date();

  let slaHours = 24;
  if (priority === 'Critical') slaHours = 2;
  else if (priority === 'High') slaHours = 12;
  else if (priority === 'Medium') slaHours = 24;
  else if (priority === 'Low') slaHours = 48;

  return {
    createdAt,
    slaDue: new Date(createdAt.getTime() + slaHours * 3600 * 1000),
  };
}

export async function GET(request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let queryBuilder = supabaseAdmin
      .from('tickets')
      .select(`
        *,
        requester:requester_id (
          id,
          full_name,
          email
        ),
        assignee:assignee_id (
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (sessionUser.role === 'user') {
      queryBuilder = queryBuilder.eq('requester_id', sessionUser.id);
    }

    if (status && status !== 'All') {
      queryBuilder = queryBuilder.eq('status', status);
    }

    if (priority && priority !== 'All') {
      queryBuilder = queryBuilder.eq('priority', priority);
    }

    if (category && category !== 'All') {
      queryBuilder = queryBuilder.eq('category', category);
    }

    if (search) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Tickets GET Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Tickets GET API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, category, priority, location, department } =
      await request.json();

    if (!title || !description || !category || !priority) {
      return NextResponse.json(
        { error: 'Missing required ticket fields' },
        { status: 400 }
      );
    }

    const { createdAt, slaDue } = getSlaDue(priority);

    const { data: fazil } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email')
      .eq('email', 'fazilpa16@gmail.com')
      .maybeSingle();

    const assigneeId = fazil?.id || null;
    const assigneeName = fazil?.full_name || 'Unassigned';

    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .insert({
        title,
        description,
        category,
        priority,
        company: sessionUser.company || 'Emirates Reem Investments PJSC',
        department: department || sessionUser.department || 'General',
        location: location || sessionUser.location || 'Abu Dhabi (HQ)',
        status: 'Open',
        requester_id: sessionUser.id,
        creator_id: sessionUser.id,
        assignee_id: assigneeId,
        source: 'web',
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
        sla_due: slaDue.toISOString(),
        rating: null,
        feedback: null,
      })
      .select()
      .single();

    if (ticketError) {
      console.error('Ticket insert error:', ticketError);
      return NextResponse.json({ error: ticketError.message }, { status: 500 });
    }

    await supabaseAdmin.from('logs').insert({
      ticket_id: ticket.id,
      user_name: sessionUser.full_name || sessionUser.email,
      action: 'Created Ticket',
      timestamp: createdAt.toISOString(),
    });

    if (assigneeId) {
      await supabaseAdmin.from('logs').insert({
        ticket_id: ticket.id,
        user_name: 'System',
        action: `Assigned ticket to ${assigneeName} (Auto)`,
        timestamp: createdAt.toISOString(),
      });
    }

    try {
      await sendEmail({
        from: 'support@company.com',
        to: sessionUser.email,
        subject: `Ticket Confirmation: [${ticket.ticket_number || ticket.id}] - ${title}`,
        htmlContent: `<h2>AuraTick Confirmation</h2><p>Dear ${sessionUser.full_name || sessionUser.email},</p><p>Your support issue <strong>${ticket.ticket_number || ticket.id}</strong>: <em>${title}</em> has been logged in the system.</p><p>SLA Due date: ${slaDue.toLocaleString()}</p>`,
      });
    } catch (emailError) {
      console.error('Creator email error:', emailError);
    }

    const { data: techUsers, error: techError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name')
      .in('role', ['technician', 'admin']);

    if (!techError && techUsers) {
      for (const tech of techUsers) {
        await supabaseAdmin.from('notifications').insert({
          user_id: tech.id,
          ticket_id: ticket.id,
          message: `New ${priority} ticket ${ticket.ticket_number || ticket.id} created by ${sessionUser.full_name || sessionUser.email}`,
          is_urgent: priority === 'Critical' || priority === 'High',
          read_status: false,
          timestamp: createdAt.toISOString(),
        });

        if (tech.email) {
          try {
            await sendEmail({
              from: 'support@company.com',
              to: tech.email,
              subject: `[New Ticket] - ${ticket.ticket_number || ticket.id}: ${title}`,
              htmlContent: `
                <h2>New Service Desk Ticket</h2>
                <p>Dear ${tech.full_name || tech.email},</p>
                <p>A new ticket <strong>${ticket.ticket_number || ticket.id}</strong> has been logged by <strong>${sessionUser.full_name || sessionUser.email}</strong>.</p>
                <p><strong>Title:</strong> ${title}</p>
                <p><strong>Priority:</strong> ${priority}</p>
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Description:</strong> ${description}</p>
                <p>SLA Due Date: ${slaDue.toLocaleString()}</p>
              `,
            });
          } catch (emailError) {
            console.error('Tech email error:', emailError);
          }
        }
      }
    }

    if (assigneeId) {
      await supabaseAdmin.from('notifications').insert({
        user_id: assigneeId,
        ticket_id: ticket.id,
        message: `Ticket ${ticket.ticket_number || ticket.id} has been automatically assigned to you.`,
        is_urgent: priority === 'Critical' || priority === 'High',
        read_status: false,
        timestamp: createdAt.toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      ticketNumber: ticket.ticket_number,
      ticket,
    });
  } catch (error) {
    console.error('Ticket POST API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}