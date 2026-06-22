import assert from 'assert';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function runTests() {
  const baseUrl = 'http://localhost:3000';
  console.log('--- Starting IT Service Desk Email Notification Integration Tests ---');

  // Helper to extract cookie from Response
  function getCookieHeader(res) {
    const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')];
    return cookies.map(c => c.split(';')[0]).join('; ');
  }

  // Database helper to fetch recorded emails directly
  async function fetchEmailsFromDb() {
    const dbPath = path.join(process.cwd(), 'node_modules', 'database.db');
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    const rows = await db.all('SELECT * FROM emails ORDER BY timestamp DESC');
    await db.close();
    return rows;
  }

  // Clear emails table first to make assertions robust
  const dbPath = path.join(process.cwd(), 'node_modules', 'database.db');
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  await db.run('DELETE FROM emails');
  await db.close();
  console.log('Cleared existing email logs from database.');

  // 1. Login as Emily Chen (user)
  console.log('Logging in as Emily Chen...');
  const loginEmilyRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail: 'user.emily', password: 'password123' })
  });
  assert.strictEqual(loginEmilyRes.status, 200, 'Emily login should succeed');
  const emilyCookie = getCookieHeader(loginEmilyRes);
  const emilyUser = (await loginEmilyRes.json()).user;

  // 2. Create ticket as Emily (should auto-assign to Fazil)
  console.log('Creating a ticket as Emily...');
  const createTicketRes = await fetch(`${baseUrl}/api/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': emilyCookie
    },
    body: JSON.stringify({
      title: 'Email Notification Test Issue',
      description: 'Verifying SMTP notifications trigger on creation, updates, notes, and chat.',
      category: 'Software',
      priority: 'High',
      location: 'Dubai Office',
      department: 'Marketing'
    })
  });
  assert.strictEqual(createTicketRes.status, 200, 'Ticket creation should succeed');
  const ticketId = (await createTicketRes.json()).ticketId;
  console.log(`Ticket TKT created successfully: ${ticketId}`);

  // Assert: Creator + IT Staff got email dispatches
  console.log('Verifying emails logged after ticket creation...');
  let sentEmails = await fetchEmailsFromDb();
  
  // 1 confirmation email to Emily + 1 alert email to each of the 8 IT staff members (admin, tech.alex, tech.jordan, tech.fazil, tech.irfan, admin.hakeem, etc.)
  // Let's verify we got at least one email to Emily Chen and one to the technician/admin emails
  const emilyConfirmEmail = sentEmails.find(e => e.to_email === emilyUser.email);
  assert.ok(emilyConfirmEmail, 'Emily (creator) should receive confirmation email');
  assert.ok(emilyConfirmEmail.subject.includes(ticketId), 'Subject should contain ticket ID');

  const itStaffEmails = sentEmails.filter(e => e.to_email !== emilyUser.email);
  assert.ok(itStaffEmails.length > 0, 'IT Staff members should receive email notifications');
  console.log(`Verified: ${itStaffEmails.length} IT staff alert emails logged successfully.`);

  // 3. Login as Fazil (technician)
  console.log('Logging in as Fazil...');
  const loginFazilRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail: 'tech.fazil', password: 'password123' })
  });
  assert.strictEqual(loginFazilRes.status, 200, 'Fazil login should succeed');
  const fazilCookie = getCookieHeader(loginFazilRes);

  // Clear email log for next step verification
  const dbClean = await open({ filename: dbPath, driver: sqlite3.Database });
  await dbClean.run('DELETE FROM emails');
  await dbClean.close();

  // 4. Fazil performs updates (assigns to Irfan, changes priority to Critical, changes status to In Progress)
  console.log('Fazil updates assignee, priority, and status on the ticket...');
  const updateRes = await fetch(`${baseUrl}/api/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': fazilCookie
    },
    body: JSON.stringify({
      assigneeId: 'user-tech-irfan',
      priority: 'Critical',
      status: 'In Progress'
    })
  });
  assert.strictEqual(updateRes.status, 200, 'Consolidated update PATCH should succeed');

  // Assert: Creator (Emily) received a single consolidated update email
  sentEmails = await fetchEmailsFromDb();
  const updateEmail = sentEmails.find(e => e.to_email === emilyUser.email);
  assert.ok(updateEmail, 'Creator should receive update alert email');
  assert.ok(updateEmail.subject.includes('Ticket Update Alert'), 'Subject should indicate update');
  assert.ok(updateEmail.html_content.includes('Assignee'), 'Email should detail assignee change');
  assert.ok(updateEmail.html_content.includes('Priority'), 'Email should detail priority change');
  assert.ok(updateEmail.html_content.includes('Status'), 'Email should detail status change');
  console.log('Consolidated update email verification passed.');

  // Clear email log for next step verification
  const dbClean2 = await open({ filename: dbPath, driver: sqlite3.Database });
  await dbClean2.run('DELETE FROM emails');
  await dbClean2.close();

  // 5. Fazil inserts a technical fix note
  console.log('Fazil adding a technical fix note...');
  const addNoteRes = await fetch(`${baseUrl}/api/tickets/${ticketId}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': fazilCookie
    },
    body: JSON.stringify({ note: 'This is a dedicated test fix note for email dispatches.' })
  });
  assert.strictEqual(addNoteRes.status, 200, 'Technical note post should succeed');

  // Assert: Creator (Emily) received the fix note email
  sentEmails = await fetchEmailsFromDb();
  const noteEmail = sentEmails.find(e => e.to_email === emilyUser.email);
  assert.ok(noteEmail, 'Creator should receive note notification');
  assert.ok(noteEmail.subject.includes('Fix Note Added'), 'Subject should indicate fix note');
  assert.ok(noteEmail.html_content.includes('dedicated test fix note'), 'Email body should contain note text');
  console.log('Technical fix note email alert verification passed.');

  // Clear email log for next step verification
  const dbClean3 = await open({ filename: dbPath, driver: sqlite3.Database });
  await dbClean3.run('DELETE FROM emails');
  await dbClean3.close();

  // 6. Fazil sends a chat message (IT -> User)
  console.log('Fazil sending a chat message to Emily...');
  const postChatRes = await fetch(`${baseUrl}/api/tickets/${ticketId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': fazilCookie
    },
    body: JSON.stringify({ message: 'Hello Emily, I am working on your email test ticket now.' })
  });
  assert.strictEqual(postChatRes.status, 200, 'Chat POST should succeed');

  // Assert: Creator (Emily) received chat message email
  sentEmails = await fetchEmailsFromDb();
  const chatEmail = sentEmails.find(e => e.to_email === emilyUser.email);
  assert.ok(chatEmail, 'Creator should receive chat reply notification');
  assert.ok(chatEmail.subject.includes('Support Reply'), 'Subject should indicate reply');
  assert.ok(chatEmail.html_content.includes('Hello Emily'), 'Email body should contain chat message');
  console.log('Support reply chat email alert verification passed.');

  // Clear email log for next step verification
  const dbClean4 = await open({ filename: dbPath, driver: sqlite3.Database });
  await dbClean4.run('DELETE FROM emails');
  await dbClean4.close();

  // 7. Emily sends a chat message (User -> IT, should email assignee Irfan)
  console.log('Emily replies in chat to assigned technician Irfan...');
  const emilyChatRes = await fetch(`${baseUrl}/api/tickets/${ticketId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': emilyCookie
    },
    body: JSON.stringify({ message: 'Thank you for the update! I see it.' })
  });
  assert.strictEqual(emilyChatRes.status, 200, 'Chat POST should succeed');

  // Assert: Assignee (Irfan) received user reply email
  sentEmails = await fetchEmailsFromDb();
  const irfanEmail = sentEmails.find(e => e.to_email === 'irfan@company.com');
  assert.ok(irfanEmail, 'Assigned technician (Irfan) should receive user reply notification');
  assert.ok(irfanEmail.subject.includes('User Reply'), 'Subject should indicate requester reply');
  assert.ok(irfanEmail.html_content.includes('Thank you for the update'), 'Email body should contain chat message');
  console.log('User reply chat email alert verification passed.');

  // Clear email log for next step verification
  const dbClean5 = await open({ filename: dbPath, driver: sqlite3.Database });
  await dbClean5.run('DELETE FROM emails');
  await dbClean5.close();

  // 8. Close the ticket (transitions status to Closed)
  console.log('Closing the ticket...');
  const closeRes = await fetch(`${baseUrl}/api/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': fazilCookie
    },
    body: JSON.stringify({ status: 'Closed' })
  });
  assert.strictEqual(closeRes.status, 200, 'Closing ticket should succeed');

  // Assert: Final closed update email sent
  sentEmails = await fetchEmailsFromDb();
  const closedEmail = sentEmails.find(e => e.to_email === emilyUser.email);
  assert.ok(closedEmail, 'Creator should receive ticket closure notification');
  console.log('Ticket closure final notification verified.');

  // Clear email log for post-closure validation
  const dbClean6 = await open({ filename: dbPath, driver: sqlite3.Database });
  await dbClean6.run('DELETE FROM emails');
  await dbClean6.close();

  // 9. Post-Closure: Technician adds a note and chat - verify NO emails sent
  console.log('Adding post-closure note and chat to verify NO email alerts are dispatched...');
  
  // Note post-closure
  await fetch(`${baseUrl}/api/tickets/${ticketId}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': fazilCookie
    },
    body: JSON.stringify({ note: 'Post-closure diagnostic notes.' })
  });

  // Chat post-closure
  await fetch(`${baseUrl}/api/tickets/${ticketId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': fazilCookie
    },
    body: JSON.stringify({ message: 'Post-closure follow-up chat.' })
  });

  // Assert: Outbox is empty (no email alerts)
  sentEmails = await fetchEmailsFromDb();
  assert.strictEqual(sentEmails.length, 0, 'No email dispatches should be created once ticket is Closed');
  console.log('Post-closure isolation (no email dispatches) verified successfully!');

  // Cleanup: Delete test ticket
  console.log('Cleaning up test ticket...');
  // Login as admin to delete
  const loginAdminRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail: 'admin.sarah', password: 'password123' })
  });
  const adminCookie = getCookieHeader(loginAdminRes);

  await fetch(`${baseUrl}/api/tickets/${ticketId}`, {
    method: 'DELETE',
    headers: { 'Cookie': adminCookie }
  });

  console.log('--- All Email Notification Integration Tests Passed Successfully! ---');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
