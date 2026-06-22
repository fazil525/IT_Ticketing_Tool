import assert from 'assert';

async function runTests() {
  const baseUrl = 'http://localhost:3000';
  console.log('--- Starting IT Service Desk User Management Integration Tests ---');

  // Helper to extract cookie from Response
  function getCookieHeader(res) {
    const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')];
    return cookies.map(c => c.split(';')[0]).join('; ');
  }

  // 1. Login as Admin (Sarah Jenkins)
  console.log('Logging in as Admin (Sarah Jenkins)...');
  const loginAdminRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail: 'admin.sarah', password: 'password123' })
  });
  assert.strictEqual(loginAdminRes.status, 200, 'Admin login should succeed');
  const adminCookie = getCookieHeader(loginAdminRes);
  console.log('Admin login successful.');

  // 2. Fetch Marcus's user profile to get his ID
  console.log('Fetching user roster to locate Marcus...');
  const getUsersRes = await fetch(`${baseUrl}/api/users`, {
    headers: { 'Cookie': adminCookie }
  });
  const users = await getUsersRes.json();
  const marcus = users.find(u => u.username === 'user.marcus');
  assert.ok(marcus, 'Marcus should exist in the roster');
  console.log(`Found Marcus (ID: ${marcus.id}).`);

  // 3. Edit Marcus: Change name, department, and reset password
  console.log('Admin updating Marcus\'s profile details & resetting password...');
  const updateRes = await fetch(`${baseUrl}/api/users/${marcus.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': adminCookie
    },
    body: JSON.stringify({
      username: 'user.marcus',
      name: 'Marcus Vance Senior',
      email: marcus.email,
      role: 'user',
      department: 'Operations',
      location: marcus.location,
      password: 'newpass123' // password reset!
    })
  });
  assert.strictEqual(updateRes.status, 200, 'Profile update and password reset should succeed');
  console.log('Marcus updated successfully.');

  // 4. Verify Marcus can login with the NEW password
  console.log('Logging in as Marcus using the NEW password...');
  const loginMarcusNewRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail: 'user.marcus', password: 'newpass123' })
  });
  assert.strictEqual(loginMarcusNewRes.status, 200, 'Marcus login with new password should succeed');
  console.log('Marcus login with new password successful!');

  // Verify the updated department and name in session
  const marcusSession = await loginMarcusNewRes.json();
  console.log(`Updated Session Profile Name: ${marcusSession.user.name}, Department: ${marcusSession.user.department}`);
  assert.strictEqual(marcusSession.user.name, 'Marcus Vance Senior', 'Name should be updated');
  assert.strictEqual(marcusSession.user.department, 'Operations', 'Department should be updated');

  // 5. Restore Marcus's password and department back to normal
  console.log('Restoring Marcus\'s password and department back to default...');
  const restoreRes = await fetch(`${baseUrl}/api/users/${marcus.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': adminCookie
    },
    body: JSON.stringify({
      username: 'user.marcus',
      name: 'Marcus Vance',
      email: marcus.email,
      role: 'user',
      department: 'Finance',
      location: marcus.location,
      password: 'password123' // reset back!
    })
  });
  assert.strictEqual(restoreRes.status, 200, 'Restoring Marcus to default should succeed');
  console.log('Marcus details successfully restored.');

  // 6. Test User Deletion & Cascade Relational Checks
  // A. Register a temporary test technician
  console.log('Admin provisioning a temporary test technician...');
  const provisionRes = await fetch(`${baseUrl}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': adminCookie
    },
    body: JSON.stringify({
      username: 'tech.temp',
      password: 'password123',
      name: 'Temp Tech',
      role: 'technician',
      email: 'temp.tech@company.com',
      employeeId: 'EMP-9999',
      company: 'Emirates Reem Investments PJSC',
      department: 'IT Support',
      location: 'Dubai Office'
    })
  });
  assert.strictEqual(provisionRes.status, 200, 'Provisioning temp technician should succeed');
  const tempTech = (await provisionRes.json()).user;
  console.log(`Temp Technician provisioned: ${tempTech.name} (ID: ${tempTech.id})`);

  // B. Login as Emily to create a support ticket
  console.log('Logging in as Emily Chen to log a support ticket...');
  const loginEmilyRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail: 'user.emily', password: 'password123' })
  });
  const emilyCookie = getCookieHeader(loginEmilyRes);
  
  console.log('Creating ticket as Emily...');
  const createTicketRes = await fetch(`${baseUrl}/api/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': emilyCookie
    },
    body: JSON.stringify({
      title: 'Temp Tech Test Ticket',
      description: 'This is a test ticket to verify assignment unlinking upon user deletion.',
      category: 'Software',
      priority: 'Low',
      location: 'Dubai Office',
      department: 'Marketing'
    })
  });
  const ticketId = (await createTicketRes.json()).ticketId;
  console.log(`Test ticket created: ${ticketId}`);

  // C. Admin assigns the ticket to our Temp Technician
  console.log('Admin assigning the test ticket to Temp Technician...');
  const assignRes = await fetch(`${baseUrl}/api/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': adminCookie
    },
    body: JSON.stringify({ assigneeId: tempTech.id })
  });
  assert.strictEqual(assignRes.status, 200, 'Ticket assignment should succeed');

  // Verify the ticket is assigned to Temp Tech
  const getTicketRes = await fetch(`${baseUrl}/api/tickets/${ticketId}`, {
    headers: { 'Cookie': adminCookie }
  });
  const ticket = await getTicketRes.json();
  console.log(`Ticket assignee before deletion: ${ticket.assigneeName}`);
  assert.strictEqual(ticket.assigneeName, 'Temp Tech', 'Assignee should be Temp Tech');

  // D. Admin deletes the Temp Technician
  console.log('Admin deleting the Temp Technician (checks cascade unassignment)...');
  const deleteRes = await fetch(`${baseUrl}/api/users/${tempTech.id}`, {
    method: 'DELETE',
    headers: { 'Cookie': adminCookie }
  });
  assert.strictEqual(deleteRes.status, 200, 'User deletion should succeed');
  console.log('Temp Technician deleted.');

  // E. Verify the ticket assignment is unassigned (assignee_id set to NULL)
  console.log('Fetching ticket details post-deletion...');
  const getTicketPostRes = await fetch(`${baseUrl}/api/tickets/${ticketId}`, {
    headers: { 'Cookie': adminCookie }
  });
  const ticketPost = await getTicketPostRes.json();
  console.log(`Ticket assignee after deletion: ${ticketPost.assigneeName} (${ticketPost.assignee_id})`);
  assert.strictEqual(ticketPost.assignee_id, null, 'Deleted technician assignee_id should be set to NULL');
  assert.strictEqual(ticketPost.assigneeName, null, 'Deleted technician assignee name should be set to NULL');
  console.log('Cascade assignment unlinking verified successfully!');

  // Clean up test ticket
  console.log('Deleting test ticket...');
  await fetch(`${baseUrl}/api/tickets/${ticketId}`, {
    method: 'DELETE',
    headers: { 'Cookie': adminCookie }
  });

  console.log('--- All User Management Integration Tests Passed Successfully! ---');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
