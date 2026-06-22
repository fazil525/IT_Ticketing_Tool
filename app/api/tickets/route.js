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

    let sql = `
      SELECT t.*, 
             u1.name AS creatorName, u1.avatar AS creatorAvatar, u1.email AS creatorEmail,
             u2.name AS assigneeName, u2.avatar AS assigneeAvatar
      FROM tickets t
      LEFT JOIN users u1 ON t.creator_id = u1.id
      LEFT JOIN users u2 ON t.assignee_id = u2.id
    `;
    const params = [];
    const conditions = [];

    // Access control: standard users can only view their own tickets
    if (sessionUser.role === 'user') {
      conditions.push('t.creator_id = ?');
      params.push(sessionUser.id);
    }

    // Filters
    if (status && status !== 'All') {
      conditions.push('t.status = ?');
      params.push(status);
    }

    if (priority && priority !== 'All') {
      conditions.push('t.priority = ?');
      params.push(priority);
    }

    if (category && category !== 'All') {
      conditions.push('t.category = ?');
      params.push(category);
    }

    if (search) {
      conditions.push('(t.title LIKE ? OR t.description LIKE ? OR t.id LIKE ?)');
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Sort by created_at descending
    sql += ' ORDER BY t.created_at DESC';

    const tickets = await query(sql, params);
    return NextResponse.json(tickets);
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

    const { title, description, category, priority, location, department } = await request.json();

    if (!title || !description || !category || !priority) {
      return NextResponse.json({ error: 'Missing required ticket fields' }, { status: 400 });
    }

    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = new Date();
    
    // SLA calculation logic
    let slaHours = 24; // Medium default
    if (priority === 'Critical') slaHours = 2;
    else if (priority === 'High') slaHours = 12;
    else if (priority === 'Medium') slaHours = 24;
    else if (priority === 'Low') slaHours = 48;

    const slaDue = new Date(createdAt.getTime() + slaHours * 3600 * 1000);

    // Fetch Fazil's account to auto-assign
    const fazil = await get("SELECT id, name FROM users WHERE username = 'tech.fazil'");
    const assigneeId = fazil ? fazil.id : null;
    const assigneeName = fazil ? fazil.name : 'Unassigned';

    // Insert Ticket
    await run(
      `INSERT INTO tickets (id, title, description, category, priority, company, department, location, status, creator_id, assignee_id, created_at, sla_due, rating, feedback)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)`,
      [
        ticketId,
        title,
        description,
        category,
        priority,
        sessionUser.company || 'Emirates Reem Investments PJSC',
        department || sessionUser.department || 'General',
        location || sessionUser.location || 'Abu Dhabi (HQ)',
        'Open',
        sessionUser.id,
        assigneeId,
        createdAt.toISOString(),
        slaDue.toISOString()
      ]
    );

    // Create Audit Log
    await run(
      `INSERT INTO logs (ticket_id, user_name, action, timestamp)
       VALUES (?, ?, ?, ?)`,
      [ticketId, sessionUser.name, 'Created Ticket', createdAt.toISOString()]
    );

    // Create Auto-Assignment Audit Log
    if (assigneeId) {
      await run(
        `INSERT INTO logs (ticket_id, user_name, action, timestamp)
         VALUES (?, ?, ?, ?)`,
        [ticketId, 'System', `Assigned ticket to ${assigneeName} (Auto)`, createdAt.toISOString()]
      );
    }

    // Send Email to Creator via Dynamic SMTP / Simulated Fallback
    await sendEmail({
      from: 'support@company.com',
      to: sessionUser.email,
      subject: `Ticket Confirmation: [${ticketId}] - ${title}`,
      htmlContent: `<h2>AuraTick Confirmation</h2><p>Dear ${sessionUser.name},</p><p>Your support issue <strong>${ticketId}</strong>: <em>${title}</em> has been logged in the system.</p><p>SLA Due date: ${slaDue.toLocaleString()}</p>`
    });

    // Create Notification & Send Email alert for Technicians/Admins
    const techUsers = await query(`SELECT id, email, name FROM users WHERE role IN ('technician', 'admin')`);
    for (const tech of techUsers) {
      const notifId = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await run(
        `INSERT INTO notifications (id, user_id, ticket_id, message, is_urgent, read_status, timestamp)
         VALUES (?, ?, ?, ?, ?, 0, ?)`,
        [
          notifId,
          tech.id,
          ticketId,
          `New ${priority} ticket ${ticketId} created by ${sessionUser.name}`,
          priority === 'Critical' || priority === 'High' ? 1 : 0,
          createdAt.toISOString()
        ]
      );

      // Alert IT Staff member via SMTP / Simulated outbox
      if (tech.email) {
        await sendEmail({
          from: 'support@company.com',
          to: tech.email,
          subject: `[New Ticket] - ${ticketId}: ${title}`,
          htmlContent: `
            <h2>New Service Desk Ticket</h2>
            <p>Dear ${tech.name},</p>
            <p>A new ticket <strong>${ticketId}</strong> has been logged in the system by <strong>${sessionUser.name}</strong>.</p>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Priority:</strong> ${priority}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p>SLA Due Date: ${slaDue.toLocaleString()}</p>
            <hr/>
            <p>Please log in to the portal to view the details.</p>
          `
        });
      }
    }

    // Create specific Assignment Notification for the assignee
    if (assigneeId) {
      const notifId = `notif-assign-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await run(
        `INSERT INTO notifications (id, user_id, ticket_id, message, is_urgent, read_status, timestamp)
         VALUES (?, ?, ?, ?, ?, 0, ?)`,
        [
          notifId,
          assigneeId,
          ticketId,
          `Ticket ${ticketId} has been automatically assigned to you.`,
          priority === 'Critical' || priority === 'High' ? 1 : 0,
          createdAt.toISOString()
        ]
      );
    }

    return NextResponse.json({ success: true, ticketId });
  } catch (error) {
    console.error('Ticket POST API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
