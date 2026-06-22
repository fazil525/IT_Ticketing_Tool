import assert from 'assert';

async function runTests() {
  const baseUrl = 'http://localhost:3000';
  console.log('--- Starting IT Service Desk API Integration Tests ---');

  // Helper to extract cookie from Response
  function getCookieHeader(res) {
    const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')];
    return cookies.map(c => c.split(';')[0]).join('; ');
  }

  // 1. Login as Emily Chen
  console.log('Logging in as Emily Chen...');
  const loginEmilyRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail: 'user.emily', password: 'password123' })
  });
  assert.strictEqual(loginEmilyRes.status, 200, 'Emily login should succeed');
  const emilyCookie = getCookieHeader(loginEmilyRes);
  console.log('Emily login successful.');

  // 2. Create Ticket as Emily (should auto-assign to Fazil)
  console.log('Creating a ticket as Emily...');
  const createTicketRes = await fetch(`${baseUrl}/api/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': emilyCookie
    },
    body: JSON.stringify({
      title: 'Broken Laptop Keyboard',
      description: 'The spacebar on my corporate laptop is not registering keystrokes. Please repair.',
      category: 'Hardware',
      priority: 'High',
      location: 'Dubai Office',
      department: 'Marketing'
    })
  });
  assert.strictEqual(createTicketRes.status, 200, 'Ticket creation should succeed');
  const createTicketData = await createTicketRes.json();
  const ticketId = createTicketData.ticketId;
  assert.ok(ticketId, 'Ticket ID should be returned');
  console.log(`Ticket created successfully: ${ticketId}`);

  // Verify ticket details & auto-assignment
  console.log('Fetching ticket details...');
  const getTicketRes = await fetch(`${baseUrl}/api/tickets/${ticketId}`, {
    headers: { 'Cookie': emilyCookie }
  });
  const ticket = await getTicketRes.json();
  console.log(`Ticket current assignee: ${ticket.assigneeName} (${ticket.assignee_id})`);
  assert.strictEqual(ticket.assigneeName, 'Fazil', 'Newly created ticket should be automatically assigned to Fazil');
  console.log('Auto-assignment to Fazil verified.');

  // 3. Login as Fazil
  console.log('Logging in as Fazil...');
  const loginFazilRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail: 'tech.fazil', password: 'password123' })
  });
  assert.strictEqual(loginFazilRes.status, 200, 'Fazil login should succeed');
  const fazilCookie = getCookieHeader(loginFazilRes);
  console.log('Fazil login successful.');

  // 4. Forward/Escalate ticket to Irfan
  console.log('Fazil escalates/forwards the ticket to Irfan...');
  const escalateToIrfanRes = await fetch(`${baseUrl}/api/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': fazilCookie
    },
    body: JSON.stringify({ assigneeId: 'user-tech-irfan' })
  });
  assert.strictEqual(escalateToIrfanRes.status, 200, 'Forwarding to Irfan should succeed');
  console.log('Forwarded to Irfan.');

  // Verify assignee is Irfan
  const ticketAfterIrfanRes = await fetch(`${baseUrl}/api/tickets/${ticketId}`, {
    headers: { 'Cookie': fazilCookie }
  });
  const ticketAfterIrfan = await ticketAfterIrfanRes.json();
  console.log(`Ticket assignee after escalation to Irfan: ${ticketAfterIrfan.assigneeName}`);
  assert.strictEqual(ticketAfterIrfan.assigneeName, 'Irfan', 'Ticket assignee should be updated to Irfan');

  // Insert fix note as Fazil
  console.log('Fazil adding a technical fix note...');
  const addFazilNoteRes = await fetch(`${baseUrl}/api/tickets/${ticketId}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': fazilCookie
    },
    body: JSON.stringify({ note: 'Attempted to clean under key cap. Still non-responsive. Escalating to Irfan for keyboard replacement.' })
  });
  assert.strictEqual(addFazilNoteRes.status, 200, 'Adding note as technician should succeed');
  console.log('Fazil fix note added successfully.');

  // 5. Login as Irfan
  console.log('Logging in as Irfan...');
  const loginIrfanRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail: 'tech.irfan', password: 'password123' })
  });
  assert.strictEqual(loginIrfanRes.status, 200, 'Irfan login should succeed');
  const irfanCookie = getCookieHeader(loginIrfanRes);
  console.log('Irfan login successful.');

  // 6. Forward/Escalate ticket to Hakeem
  console.log('Irfan escalates/forwards the ticket to Hakeem (IT Manager)...');
  const escalateToHakeemRes = await fetch(`${baseUrl}/api/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': irfanCookie
    },
    body: JSON.stringify({ assigneeId: 'user-admin-hakeem' })
  });
  assert.strictEqual(escalateToHakeemRes.status, 200, 'Forwarding to Hakeem should succeed');
  console.log('Forwarded to Hakeem.');

  // Verify assignee is Hakeem
  const ticketAfterHakeemRes = await fetch(`${baseUrl}/api/tickets/${ticketId}`, {
    headers: { 'Cookie': irfanCookie }
  });
  const ticketAfterHakeem = await ticketAfterHakeemRes.json();
  console.log(`Ticket assignee after escalation to Hakeem: ${ticketAfterHakeem.assigneeName}`);
  assert.strictEqual(ticketAfterHakeem.assigneeName, 'Hakeem (IT Manager)', 'Ticket assignee should be updated to Hakeem');

  // Insert fix note as Irfan
  console.log('Irfan adding a technical fix note...');
  const addIrfanNoteRes = await fetch(`${baseUrl}/api/tickets/${ticketId}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': irfanCookie
    },
    body: JSON.stringify({ note: 'Requires OEM replacement parts that require manager sign-off. Escalated to Hakeem.' })
  });
  assert.strictEqual(addIrfanNoteRes.status, 200, 'Adding note as technician should succeed');
  console.log('Irfan fix note added successfully.');

  // 7. Verify all notes history
  console.log('Fetching notes history for the ticket...');
  const getNotesRes = await fetch(`${baseUrl}/api/tickets/${ticketId}/notes`, {
    headers: { 'Cookie': irfanCookie }
  });
  const notes = await getNotesRes.json();
  console.log('Notes history fetched:');
  console.log(notes.map(n => `[${n.user_name}]: ${n.note}`));
  assert.strictEqual(notes.length, 2, 'There should be 2 notes in history');
  assert.strictEqual(notes[0].user_name, 'Fazil', 'First note should be by Fazil');
  assert.strictEqual(notes[1].user_name, 'Irfan', 'Second note should be by Irfan');

  console.log('--- All Tests Passed Successfully! ---');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
