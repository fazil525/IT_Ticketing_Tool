import { get, query, run } from '@/lib/db.js';
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

    // Fetch Ticket details
    const ticket = await get(
      `SELECT t.*, 
              u1.name AS creatorName, u1.avatar AS creatorAvatar, u1.email AS creatorEmail,
              u2.name AS assigneeName, u2.avatar AS assigneeAvatar
       FROM tickets t
       LEFT JOIN users u1 ON t.creator_id = u1.id
       LEFT JOIN users u2 ON t.assignee_id = u2.id
       WHERE t.id = ?`,
      [id]
    );

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Access control
    if (sessionUser.role === 'user' && ticket.creator_id !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch Audit Logs
    const logs = await query(
      `SELECT timestamp, user_name AS user, action 
       FROM logs 
       WHERE ticket_id = ? 
       ORDER BY timestamp ASC`,
      [id]
    );

    return NextResponse.json({ ...ticket, logs });
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

    // Fetch ticket first to check permissions and get current values
    const ticket = await get(`SELECT * FROM tickets WHERE id = ?`, [id]);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Access control
    if (sessionUser.role === 'user' && ticket.creator_id !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = [];
    const dbParams = [];
    const now = new Date().toISOString();
    
    // Change tracking for creator notification
    const changeLog = [];
    let creatorEmail = null;
    let creatorName = null;

    if (ticket.creator_id !== sessionUser.id) {
      const creator = await get(`SELECT email, name FROM users WHERE id = ?`, [ticket.creator_id]);
      if (creator) {
        creatorEmail = creator.email;
        creatorName = creator.name;
      }
    }

    // 1. Assignee Update (restricted to admin and technicians)
    if ('assigneeId' in body) {
      if (sessionUser.role === 'user') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      
      const newAssigneeId = body.assigneeId;
      updates.push('assignee_id = ?');
      dbParams.push(newAssigneeId);

      let logAction = 'Unassigned ticket';
      let assigneeName = 'Unassigned';

      if (newAssigneeId) {
        const assignee = await get(`SELECT name FROM users WHERE id = ?`, [newAssigneeId]);
        if (assignee) {
          assigneeName = assignee.name;
          logAction = `Assigned ticket to ${assigneeName}`;
        }
      }

      await run(
        `INSERT INTO logs (ticket_id, user_name, action, timestamp) VALUES (?, ?, ?, ?)`,
        [id, sessionUser.name, logAction, now]
      );

      // Create Notification for the assignee
      if (newAssigneeId && newAssigneeId !== sessionUser.id) {
        await run(
          `INSERT INTO notifications (id, user_id, ticket_id, message, is_urgent, read_status, timestamp)
           VALUES (?, ?, ?, ?, 0, 0, ?)`,
          [`notif-${Date.now()}-${Math.floor(Math.random()*100)}`, newAssigneeId, id, `Ticket ${id} has been assigned to you by ${sessionUser.name}`, now]
        );
      }

      if (creatorEmail) {
        changeLog.push(`<strong>Assignee:</strong> changed to ${assigneeName}`);
      }
    }

    // 2. Status Update
    if ('status' in body) {
      const newStatus = body.status;
      updates.push('status = ?');
      dbParams.push(newStatus);

      const isClosedOrResolved = ticket.status === 'Closed' || ticket.status === 'Resolved';
      const isMovingToActive = newStatus === 'Open' || newStatus === 'In Progress';
      const logAction = (isClosedOrResolved && isMovingToActive) ? 'Reopened ticket' : `Updated status to ${newStatus}`;

      await run(
        `INSERT INTO logs (ticket_id, user_name, action, timestamp) VALUES (?, ?, ?, ?)`,
        [id, sessionUser.name, logAction, now]
      );

      // Notification to Creator (if updated by someone else)
      if (ticket.creator_id !== sessionUser.id) {
        await run(
          `INSERT INTO notifications (id, user_id, ticket_id, message, is_urgent, read_status, timestamp)
           VALUES (?, ?, ?, ?, 0, 0, ?)`,
          [`notif-${Date.now()}-${Math.floor(Math.random()*100)}`, ticket.creator_id, id, `Ticket ${id} status updated to ${newStatus} by ${sessionUser.name}`, now]
        );
      }

      if (creatorEmail) {
        changeLog.push(`<strong>Status:</strong> updated to ${newStatus}`);
      }
    }

    // 3. Priority Update (restricted to admin and technicians)
    if ('priority' in body) {
      if (sessionUser.role === 'user') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const newPriority = body.priority;
      updates.push('priority = ?');
      dbParams.push(newPriority);

      await run(
        `INSERT INTO logs (ticket_id, user_name, action, timestamp) VALUES (?, ?, ?, ?)`,
        [id, sessionUser.name, `Changed priority to ${newPriority}`, now]
      );

      if (creatorEmail) {
        changeLog.push(`<strong>Priority:</strong> updated to ${newPriority}`);
      }
    }

    // 4. CSAT Rating and Feedback (normally done by ticket creator)
    if ('rating' in body || 'feedback' in body) {
      if ('rating' in body) {
        updates.push('rating = ?');
        dbParams.push(body.rating);
      }
      if ('feedback' in body) {
        updates.push('feedback = ?');
        dbParams.push(body.feedback);
      }

      await run(
        `INSERT INTO logs (ticket_id, user_name, action, timestamp) VALUES (?, ?, ?, ?)`,
        [id, sessionUser.name, `Submitted customer feedback and rating`, now]
      );
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    // Execute update statement
    dbParams.push(id);
    await run(
      `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`,
      dbParams
    );

    // Send consolidated email alert to the creator (standard user) if the ticket is not already closed
    if (creatorEmail && ticket.status !== 'Closed' && changeLog.length > 0) {
      await sendEmail({
        from: 'support@company.com',
        to: creatorEmail,
        subject: `Ticket Update Alert: [${id}]`,
        htmlContent: `
          <h2>Ticket Update Notification</h2>
          <p>Dear ${creatorName},</p>
          <p>Your support ticket <strong>${id}</strong> has been updated by <strong>${sessionUser.name}</strong>.</p>
          <p>The following changes were made:</p>
          <ul>
            ${changeLog.map(change => `<li>${change}</li>`).join('')}
          </ul>
          <hr/>
          <p>Please log in to the portal to view the active details.</p>
        `
      });
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
    await run(`DELETE FROM tickets WHERE id = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ticket DELETE API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
