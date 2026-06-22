// AuraTick Combined Application Code (Optimized for Local file:// Protocol execution)

// ==========================================
// 1. INITIAL MOCK DATABASE SEED
// ==========================================
const INITIAL_USERS = [
  {
    id: "user-admin",
    username: "admin.sarah",
    password: "password123",
    name: "Sarah Jenkins",
    role: "admin",
    email: "s.jenkins@company.com",
    employeeId: "EMP-0001",
    company: "Emirates Reem Investments PJSC",
    department: "IT Support",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
  },
  {
    id: "user-tech-1",
    username: "tech.alex",
    password: "password123",
    name: "Alex Rivera",
    role: "technician",
    email: "a.rivera@company.com",
    employeeId: "EMP-0002",
    company: "Emirates Reem Investments PJSC",
    department: "IT Infrastructure",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
  },
  {
    id: "user-tech-2",
    username: "tech.jordan",
    password: "password123",
    name: "Jordan Blake",
    role: "technician",
    email: "j.blake@company.com",
    employeeId: "EMP-0003",
    company: "Emirates Reem Investments PJSC",
    department: "IT Support",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150"
  },
  {
    id: "user-emp-1",
    username: "user.emily",
    password: "password123",
    name: "Emily Chen",
    role: "user",
    email: "e.chen@company.com",
    employeeId: "EMP-1004",
    company: "Emirates Reem Investments PJSC",
    department: "Marketing",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
  },
  {
    id: "user-emp-2",
    username: "user.marcus",
    password: "password123",
    name: "Marcus Vance",
    role: "user",
    email: "m.vance@company.com",
    employeeId: "EMP-1005",
    company: "Emirates Reem Investments PJSC",
    department: "Finance",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  }
];

const INITIAL_FAQS = [
  {
    id: "faq-1",
    category: "Network",
    title: "How to connect to the Company VPN?",
    summary: "Step-by-step instructions on setting up and connecting to the secure company network from home.",
    content: "1. Open the GlobalProtect/Cisco AnyConnect client on your desktop.\n2. In the portal address field, enter: `vpn.company.com`.\n3. Enter your active credentials and authorize the sign-in using your mobile Authenticator app (2FA).\n4. Once connected, the agent icon in your system tray will show a secure lock.\n\n*Note: If your credentials are not accepted, please verify if your password expired.*"
  },
  {
    id: "faq-2",
    category: "Accounts",
    title: "How do I reset my Windows password?",
    summary: "Quick self-service instructions for resetting locked active directory accounts.",
    content: "1. Go to the password reset portal: `https://password.company.com`.\n2. Enter your username and complete the Captcha.\n3. Verify your identity using SMS or your personal secondary email.\n4. Enter a new password that has at least 12 characters, including numbers, uppercase letters, and symbols.\n\n*If you are completely locked out and cannot access 2FA, contact the IT Service Desk directly.*"
  },
  {
    id: "faq-3",
    category: "Hardware",
    title: "Printer configuration & setup guides",
    summary: "How to add the main office floor printers to your system.",
    content: "1. Open Windows Settings and go to **Bluetooth & devices** -> **Printers & scanners**.\n2. Click on **Add device**.\n3. The system will scan. Select **The printer that I want isn't listed**.\n4. Choose **Find a printer in the directory**.\n5. Search for `PRT-HQ-FL2` (for Floor 2) or `PRT-HQ-FL3` (for Floor 3) and click next to install drivers.\n\n*Requires your system to be connected to the office Wi-Fi or VPN.*"
  },
  {
    id: "faq-4",
    category: "Software",
    title: "Clearing browser cache & cookies",
    summary: "Fix standard loading and authentication bugs on internal tools.",
    content: "1. For Google Chrome or Edge, press `Ctrl + Shift + Delete` simultaneously.\n2. In the 'Time Range' dropdown, select **All Time**.\n3. Check the boxes for **Cookies and other site data** and **Cached images and files**.\n4. Click **Clear data**.\n5. Restart your browser and reload the application."
  },
  {
    id: "faq-5",
    category: "Network",
    title: "Office Wi-Fi isn't authenticating",
    summary: "How to reset your Wi-Fi credentials for the corporate wireless network.",
    content: "1. In your system tray, click the Wi-Fi icon, right-click the network **Company-Secure** and select **Forget**.\n2. Re-select **Company-Secure** and click **Connect**.\n3. When prompted, enter your Windows login username (without @company.com) and your active password.\n4. Accept the security certificate prompt if it appears."
  }
];

const INITIAL_TICKETS = [
  {
    id: "TKT-8241",
    title: "VPN connection dropping repeatedly",
    description: "Every time I connect to the company VPN, it drops after about 5-10 minutes of active usage. I am unable to access internal development servers. I tried restarting my router but the problem persists.",
    category: "Network",
    priority: "High",
    status: "In Progress",
    creatorId: "user-emp-1",
    creatorName: "Emily Chen",
    creatorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    assigneeId: "user-tech-1",
    assigneeName: "Alex Rivera",
    company: "Emirates Reem Investments PJSC",
    department: "Marketing",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
    slaDue: new Date(Date.now() - 3600000 * 16).toISOString(),   // SLA limit
    logs: [
      { timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), user: "Emily Chen", action: "Created Ticket" },
      { timestamp: new Date(Date.now() - 3600000 * 23.5).toISOString(), user: "Sarah Jenkins", action: "Assigned ticket to Alex Rivera" },
      { timestamp: new Date(Date.now() - 3600000 * 22).toISOString(), user: "Alex Rivera", action: "Updated status to In Progress" }
    ],
    chat: [
      {
        id: "c1",
        senderId: "user-tech-1",
        senderName: "Alex Rivera",
        senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        message: "Hi Emily, I'm checking the firewall logs for your IP. Could you let me know if you are connecting via Wi-Fi or ethernet at home?",
        timestamp: new Date(Date.now() - 3600000 * 21).toISOString()
      },
      {
        id: "c2",
        senderId: "user-emp-1",
        senderName: "Emily Chen",
        senderAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        message: "Hi Alex! I'm on Wi-Fi. The router is quite close to me though. Other apps work perfectly fine without disconnects.",
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString()
      },
      {
        id: "c3",
        senderId: "user-tech-1",
        senderName: "Alex Rivera",
        senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        message: "Understood. I suspect an MTU configuration conflict on your home broadband network. Let's try running a quick command prompt fix later if you're free.",
        timestamp: new Date(Date.now() - 3600000 * 19.5).toISOString()
      }
    ],
    rating: null,
    feedback: ""
  },
  {
    id: "TKT-3129",
    title: "Monitor not receiving power or display signal",
    description: "My secondary monitor (Dell 27-inch) has gone completely black. The power button indicator is not lit up. I checked the power cord and HDMI cables, swapped them around, but it still does not turn on. I might need a replacement.",
    category: "Hardware",
    priority: "Medium",
    status: "Open",
    creatorId: "user-emp-2",
    creatorName: "Marcus Vance",
    creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    assigneeId: null,
    assigneeName: "Unassigned",
    company: "Emirates Reem Investments PJSC",
    department: "Finance",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    slaDue: new Date(Date.now() + 3600000 * 20).toISOString(),
    logs: [
      { timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), user: "Marcus Vance", action: "Created Ticket" }
    ],
    chat: [],
    rating: null,
    feedback: ""
  },
  {
    id: "TKT-9951",
    title: "Critical Adobe Suite license error",
    description: "Photoshop and Illustrator are showing a 'License Expired' pop-up when launching, although my corporate account should be active. I have a critical marketing delivery tomorrow morning.",
    category: "Software",
    priority: "Critical",
    status: "Resolved",
    creatorId: "user-emp-1",
    creatorName: "Emily Chen",
    creatorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    assigneeId: "user-tech-2",
    assigneeName: "Jordan Blake",
    company: "Emirates Reem Investments PJSC",
    department: "Marketing",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    slaDue: new Date(Date.now() - 3600000 * 10).toISOString(),
    logs: [
      { timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), user: "Emily Chen", action: "Created Ticket" },
      { timestamp: new Date(Date.now() - 3600000 * 11.8).toISOString(), user: "Sarah Jenkins", action: "Assigned ticket to Jordan Blake" },
      { timestamp: new Date(Date.now() - 3600000 * 11.5).toISOString(), user: "Jordan Blake", action: "Updated status to In Progress" },
      { timestamp: new Date(Date.now() - 3600000 * 10.5).toISOString(), user: "Jordan Blake", action: "Updated status to Resolved" }
    ],
    chat: [
      {
        id: "c4",
        senderId: "user-tech-2",
        senderName: "Jordan Blake",
        senderAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
        message: "Hi Emily, I've re-synced your Creative Cloud profile from the Adobe Admin Console. Could you please sign out of Adobe CC, restart your PC, and sign back in using corporate SSO?",
        timestamp: new Date(Date.now() - 3600000 * 11).toISOString()
      },
      {
        id: "c5",
        senderId: "user-emp-1",
        senderName: "Emily Chen",
        senderAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        message: "Wow, that did it! I signed out, restarted, logged back in and everything works perfectly. You are a lifesaver, Jordan!",
        timestamp: new Date(Date.now() - 3600000 * 10.6).toISOString()
      },
      {
        id: "c6",
        senderId: "user-tech-2",
        senderName: "Jordan Blake",
        senderAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
        message: "Awesome, glad it resolved! I will mark this ticket as Resolved. Feel free to close it at your convenience.",
        timestamp: new Date(Date.now() - 3600000 * 10.5).toISOString()
      }
    ],
    rating: null,
    feedback: ""
  }
];

// ==========================================
// 2. STATE MANAGER CLASS & STORE
// ==========================================
class TicketStore {
  constructor() {
    this.listeners = [];
    this.init();
  }

  init() {
    if (!localStorage.getItem('auratick_users')) {
      localStorage.setItem('auratick_users', JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem('auratick_tickets')) {
      localStorage.setItem('auratick_tickets', JSON.stringify(INITIAL_TICKETS));
    }
    if (!localStorage.getItem('auratick_faqs')) {
      localStorage.setItem('auratick_faqs', JSON.stringify(INITIAL_FAQS));
    }
    if (!localStorage.getItem('auratick_notifications')) {
      localStorage.setItem('auratick_notifications', JSON.stringify([]));
    }
    if (!localStorage.getItem('auratick_emails')) {
      localStorage.setItem('auratick_emails', JSON.stringify([]));
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener());
  }

  getUsers() {
    return JSON.parse(localStorage.getItem('auratick_users'));
  }

  saveUsers(users) {
    localStorage.setItem('auratick_users', JSON.stringify(users));
    this.notify();
  }

  getTickets() {
    return JSON.parse(localStorage.getItem('auratick_tickets'));
  }

  saveTickets(tickets) {
    localStorage.setItem('auratick_tickets', JSON.stringify(tickets));
    this.notify();
  }

  getFaqs() {
    return JSON.parse(localStorage.getItem('auratick_faqs'));
  }

  saveFaqs(faqs) {
    localStorage.setItem('auratick_faqs', JSON.stringify(faqs));
    this.notify();
  }

  getNotifications() {
    return JSON.parse(localStorage.getItem('auratick_notifications'));
  }

  saveNotifications(notifications) {
    localStorage.setItem('auratick_notifications', JSON.stringify(notifications));
    this.notify();
  }

  getEmails() {
    return JSON.parse(localStorage.getItem('auratick_emails'));
  }

  saveEmails(emails) {
    localStorage.setItem('auratick_emails', JSON.stringify(emails));
    this.notify();
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('auratick_current_user'));
  }

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('auratick_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auratick_current_user');
    }
    this.notify();
  }

  // --- ACTIONS ---
  login(usernameOrEmail, password) {
    const users = this.getUsers();
    const q = usernameOrEmail.toLowerCase().trim();
    const user = users.find(u => 
      (u.username.toLowerCase() === q || u.email.toLowerCase() === q) && 
      u.password === password
    );
    if (!user) {
      throw new Error("Invalid username/email or password.");
    }
    this.setCurrentUser(user);
    return user;
  }

  createUser(username, name, email, role, employeeId, company, department, password = "password123") {
    const users = this.getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase().trim())) {
      throw new Error("Username already exists!");
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
      throw new Error("Email address already exists!");
    }
    const newUser = {
      id: `user-${Date.now()}`,
      username: username.toLowerCase().trim().replace(/\s+/g, '.'),
      password,
      name,
      role,
      email: email.trim(),
      employeeId: employeeId.trim(),
      company: company.trim(),
      department: department.trim(),
      avatar: `https://images.unsplash.com/photo-${role === 'technician' ? '1535713875002-d1d0cf377fde' : '1570295999919-56ceb5ecca61'}?w=150`
    };
    users.push(newUser);
    this.saveUsers(users);

    this.createInAppNotification("user-admin", `User account created for ${name} (${role})`);
    this.sendSimulatedEmail(
      "system@auratick.com",
      email,
      "Welcome to AuraTick - Account Created",
      `<h2>Welcome to AuraTick, ${name}!</h2><p>An IT Service Portal account has been created for you by the Administrator.</p><p><strong>Username:</strong> ${username}<br><strong>Role:</strong> ${role.toUpperCase()}</p><p>You can now log in and start managing or raising tickets.</p>`
    );
    return newUser;
  }

  createTicket(title, description, category, priority, company, department) {
    const currentUser = this.getCurrentUser();
    const tickets = this.getTickets();
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const slaHours = { 'Critical': 2, 'High': 8, 'Medium': 24, 'Low': 48 };
    const hours = slaHours[priority] || 24;
    const slaDue = new Date(Date.now() + 3600000 * hours).toISOString();

    const newTicket = {
      id: ticketId,
      title,
      description,
      category,
      priority,
      company,
      department,
      status: "Open",
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorAvatar: currentUser.avatar,
      assigneeId: null,
      assigneeName: "Unassigned",
      createdAt: new Date().toISOString(),
      slaDue,
      logs: [
        { timestamp: new Date().toISOString(), user: currentUser.name, action: "Created Ticket" }
      ],
      chat: [],
      rating: null,
      feedback: ""
    };

    tickets.unshift(newTicket);
    this.saveTickets(tickets);

    this.createInAppNotification("user-admin", `New high-priority ticket ${ticketId} raised by ${currentUser.name}`, priority === 'Critical' || priority === 'High');
    
    this.sendSimulatedEmail(
      "support@company.com",
      currentUser.email,
      `Ticket Received: [${ticketId}] - ${title}`,
      `<h2>Ticket Confirmation</h2><p>Dear ${currentUser.name},</p><p>We have successfully received your IT support ticket. Our team has been notified.</p><p><strong>Ticket ID:</strong> ${ticketId}<br><strong>Category:</strong> ${category}<br><strong>Priority:</strong> ${priority}<br><strong>SLA Resolution Plan:</strong> Within ${hours} hours</p><hr><p><em>"${description}"</em></p>`
    );

    const admins = this.getUsers().filter(u => u.role === 'admin');
    admins.forEach(admin => {
      this.sendSimulatedEmail(
        "system@company.com",
        admin.email,
        `Alert: New Ticket [${ticketId}] - Priority: ${priority}`,
        `<h2>New Support Ticket Alert</h2><p>A new IT support ticket requires attention.</p><p><strong>From:</strong> ${currentUser.name}<br><strong>Priority:</strong> ${priority}<br><strong>Subject:</strong> ${title}</p>`
      );
    });

    return newTicket;
  }

  assignTicket(ticketId, technicianId) {
    const tickets = this.getTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return;

    const ticket = tickets[ticketIndex];
    const currentUser = this.getCurrentUser();
    const technicians = this.getUsers().filter(u => u.role === 'technician');
    const tech = technicians.find(t => t.id === technicianId);

    if (!tech) return;

    ticket.assigneeId = tech.id;
    ticket.assigneeName = tech.name;
    ticket.logs.push({
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      action: `Assigned ticket to ${tech.name}`
    });

    this.saveTickets(tickets);

    this.createInAppNotification(tech.id, `You have been assigned Ticket ${ticketId}: "${ticket.title}"`);
    this.createInAppNotification(ticket.creatorId, `Your Ticket ${ticketId} has been assigned to technician ${tech.name}`);

    this.sendSimulatedEmail(
      "system@company.com",
      tech.email,
      `Assigned Ticket Alert: [${ticketId}]`,
      `<h2>New Ticket Assignment</h2><p>Hi ${tech.name},</p><p>You have been assigned to handle support ticket <strong>${ticketId}</strong>.</p><p><strong>Title:</strong> ${ticket.title}<br><strong>User:</strong> ${ticket.creatorName}</p>`
    );

    const creator = this.getUsers().find(u => u.id === ticket.creatorId);
    if (creator) {
      this.sendSimulatedEmail(
        "support@company.com",
        creator.email,
        `Technician Assigned to [${ticketId}]`,
        `<h2>Support Update</h2><p>Dear ${ticket.creatorName},</p><p>Your ticket <strong>${ticketId}</strong> is now being actively handled by senior technician <strong>${tech.name}</strong>.</p>`
      );
    }
  }

  updateTicketStatus(ticketId, status) {
    const tickets = this.getTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return;

    const ticket = tickets[ticketIndex];
    const currentUser = this.getCurrentUser();
    const oldStatus = ticket.status;

    ticket.status = status;
    ticket.logs.push({
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      action: `Updated status from ${oldStatus} to ${status}`
    });

    this.saveTickets(tickets);

    const targetUserId = currentUser.id === ticket.creatorId ? ticket.assigneeId : ticket.creatorId;
    if (targetUserId && targetUserId !== "Unassigned") {
      this.createInAppNotification(targetUserId, `Ticket ${ticketId} status updated to: ${status}`);
    }

    const creator = this.getUsers().find(u => u.id === ticket.creatorId);
    if (creator && currentUser.id !== creator.id) {
      this.sendSimulatedEmail(
        "support@company.com",
        creator.email,
        `Status Update: [${ticketId}] is now ${status}`,
        `<h2>Ticket Status Update</h2><p>Dear ${ticket.creatorName},</p><p>The status of your ticket <strong>${ticketId}</strong> has been updated to <strong>${status}</strong> by ${currentUser.name}.</p>`
      );
    }
  }

  updateTicketPriority(ticketId, priority) {
    const tickets = this.getTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return;

    const ticket = tickets[ticketIndex];
    const currentUser = this.getCurrentUser();
    const oldPriority = ticket.priority;

    ticket.priority = priority;
    
    const slaHours = { 'Critical': 2, 'High': 8, 'Medium': 24, 'Low': 48 };
    const hours = slaHours[priority] || 24;
    ticket.slaDue = new Date(new Date(ticket.createdAt).getTime() + 3600000 * hours).toISOString();

    ticket.logs.push({
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      action: `Changed priority from ${oldPriority} to ${priority}`
    });

    this.saveTickets(tickets);

    const targetUserId = currentUser.id === ticket.creatorId ? ticket.assigneeId : ticket.creatorId;
    if (targetUserId && targetUserId !== "Unassigned") {
      this.createInAppNotification(targetUserId, `Ticket ${ticketId} priority changed to: ${priority}`);
    }
  }

  addChatMessage(ticketId, messageText) {
    const tickets = this.getTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return;

    const ticket = tickets[ticketIndex];
    const currentUser = this.getCurrentUser();

    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      message: messageText,
      timestamp: new Date().toISOString()
    };

    ticket.chat.push(newMessage);
    ticket.logs.push({
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      action: "Sent a message in support chat"
    });

    this.saveTickets(tickets);

    const recipientId = currentUser.id === ticket.creatorId ? ticket.assigneeId : ticket.creatorId;
    if (recipientId && recipientId !== "Unassigned") {
      this.createInAppNotification(recipientId, `${currentUser.name} sent a chat message on ${ticketId}`);
      
      const recipient = this.getUsers().find(u => u.id === recipientId);
      if (recipient) {
        this.sendSimulatedEmail(
          "chat@company.com",
          recipient.email,
          `New Support Chat on [${ticketId}]`,
          `<p><strong>${currentUser.name}</strong> said: </p><blockquote>"${messageText}"</blockquote>`
        );
      }
    }

    this.triggerSimulatedBotReply(ticketId, currentUser, messageText);
  }

  closeTicket(ticketId, rating = null, feedback = "") {
    const tickets = this.getTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return;

    const ticket = tickets[ticketIndex];
    const currentUser = this.getCurrentUser();

    ticket.status = "Closed";
    ticket.rating = rating;
    ticket.feedback = feedback;
    ticket.logs.push({
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      action: rating ? `Closed ticket and rated ${rating} Stars` : "Closed ticket"
    });

    this.saveTickets(tickets);

    const targetUserId = currentUser.id === ticket.creatorId ? ticket.assigneeId : ticket.creatorId;
    if (targetUserId && targetUserId !== "Unassigned") {
      this.createInAppNotification(targetUserId, `Ticket ${ticketId} was successfully Closed by ${currentUser.name}`);
    }

    const emailRecipients = [ticket.creatorId, ticket.assigneeId].filter(id => id && id !== "Unassigned" && id !== currentUser.id);
    emailRecipients.forEach(id => {
      const recipient = this.getUsers().find(u => u.id === id);
      if (recipient) {
        this.sendSimulatedEmail(
          "support@company.com",
          recipient.email,
          `Ticket Closed: [${ticketId}]`,
          `<h2>Support Resolved</h2><p>Ticket <strong>${ticketId}</strong> has been successfully closed.</p>`
        );
      }
    });
  }

  reopenTicket(ticketId) {
    const tickets = this.getTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return;

    const ticket = tickets[ticketIndex];
    const currentUser = this.getCurrentUser();

    ticket.status = "Open";
    ticket.rating = null;
    ticket.feedback = "";
    ticket.logs.push({
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      action: "Reopened ticket"
    });

    this.saveTickets(tickets);

    const targetUserId = currentUser.id === ticket.creatorId ? ticket.assigneeId : ticket.creatorId;
    if (targetUserId && targetUserId !== "Unassigned") {
      this.createInAppNotification(targetUserId, `Ticket ${ticketId} has been REOPENED by ${currentUser.name}`);
    }

    const emailRecipients = [ticket.creatorId, ticket.assigneeId].filter(id => id && id !== "Unassigned" && id !== currentUser.id);
    emailRecipients.forEach(id => {
      const recipient = this.getUsers().find(u => u.id === id);
      if (recipient) {
        this.sendSimulatedEmail(
          "support@company.com",
          recipient.email,
          `Ticket Reopened Alert: [${ticketId}]`,
          `<h2>Ticket Reopened</h2><p>Ticket <strong>${ticketId}</strong> has been reopened for further investigation by ${currentUser.name}.</p>`
        );
      }
    });
  }

  createInAppNotification(userId, message, isUrgent = false) {
    const notifications = this.getNotifications();
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      message,
      isUrgent,
      read: false,
      timestamp: new Date().toISOString()
    };
    notifications.unshift(newNotif);
    this.saveNotifications(notifications);
  }

  sendSimulatedEmail(from, to, subject, htmlContent) {
    const emails = this.getEmails();
    const newEmail = {
      id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      from,
      to,
      subject,
      htmlContent,
      timestamp: new Date().toISOString()
    };
    emails.unshift(newEmail);
    this.saveEmails(emails);
  }

  triggerSimulatedBotReply(ticketId, senderUser, messageText) {
    const tickets = this.getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    let botReplyConfig = null;

    if (senderUser.role === 'user') {
      const tech = this.getUsers().find(u => u.id === ticket.assigneeId) || this.getUsers().find(u => u.role === 'technician');
      botReplyConfig = {
        senderId: tech.id,
        senderName: tech.name,
        senderAvatar: tech.avatar,
        replies: [
          `Thanks for the details! I have checked the system diagnostics. Let me apply a configuration profile update. Can you check again in 5 minutes?`,
          `Understood. I am auditing the network diagnostic logs now. Could you please send me the exact error screen text?`,
          `Got it! I will start working on this immediately. I'll let you know when the initial patch is deployed.`,
          `Okay, that makes sense. I have updated the work schedule. Let's schedule a remote session if needed.`
        ]
      };
    } else {
      const user = this.getUsers().find(u => u.id === ticket.creatorId);
      botReplyConfig = {
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar,
        replies: [
          `Yes, I just checked and it works fine now! Thank you so much for the swift action!`,
          `No, I am still seeing the same screen error. Should I restart my browser?`,
          `Perfect, I will try that configuration now and report back!`,
          `Thanks for looking into this! I am free all day if you need to run remote screen-sharing.`
        ]
      };
    }

    setTimeout(() => {
      const latestTickets = this.getTickets();
      const currentTkt = latestTickets.find(t => t.id === ticketId);
      if (!currentTkt) return;

      const replies = botReplyConfig.replies;
      let replyStr = replies[Math.floor(Math.random() * replies.length)];

      if (messageText.toLowerCase().includes("working") || messageText.toLowerCase().includes("solved") || messageText.toLowerCase().includes("fixed")) {
        replyStr = "That is amazing news! Thanks for resolving this so fast. I'll go ahead and mark this as completed.";
      }

      const botMessage = {
        id: `msg-bot-${Date.now()}`,
        senderId: botReplyConfig.senderId,
        senderName: botReplyConfig.senderName,
        senderAvatar: botReplyConfig.senderAvatar,
        message: replyStr,
        timestamp: new Date().toISOString()
      };

      currentTkt.chat.push(botMessage);
      currentTkt.logs.push({
        timestamp: new Date().toISOString(),
        user: botReplyConfig.senderName,
        action: "Sent a message in support chat"
      });

      this.saveTickets(latestTickets);

      this.createInAppNotification(senderUser.id, `${botReplyConfig.senderName} replied to your message on ${ticketId}`);
      
      this.sendSimulatedEmail(
        "chat@company.com",
        senderUser.email,
        `New reply from ${botReplyConfig.senderName} [${ticketId}]`,
        `<p><strong>${botReplyConfig.senderName}</strong> said: </p><blockquote style="border-left:4px solid #6366f1; padding-left:10px; margin: 10px 0; color:#4b5563;">"${replyStr}"</blockquote>`
      );
    }, 1500);
  }
}

const store = new TicketStore();

// ==========================================
// 3. CORE UI RENDER ENGINE
// ==========================================
class AuraTickUI {
  constructor() {
    this.activeTab = 'dashboard';
    this.activeTicketId = null;
    this.selectedEmailId = null;
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.priorityFilter = 'all';
    this.categoryFilter = 'all';
    this.faqSearchQuery = '';
    this.selectedRating = 5;

    // Connect reactive changes
    store.subscribe(() => this.render());
  }

  init() {
    this.setupGlobalEventListeners();
    this.render();
  }

  setupGlobalEventListeners() {
    document.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-tab]');
      if (tabBtn) {
        this.activeTab = tabBtn.dataset.tab;
        this.activeTicketId = null;
        this.render();
        return;
      }

      const logoutBtn = e.target.closest('#sidebar-logout-btn');
      if (logoutBtn) {
        store.setCurrentUser(null);
        return;
      }

      const ticketRow = e.target.closest('[data-ticket-id]');
      if (ticketRow && !e.target.closest('.no-row-click')) {
        this.activeTicketId = ticketRow.dataset.ticketId;
        this.activeTab = 'ticket-details';
        this.render();
        return;
      }

      const notifBell = e.target.closest('#notif-bell-btn');
      if (notifBell) {
        document.getElementById('notif-dropdown').classList.toggle('hidden');
        e.stopPropagation();
        return;
      }

      const notifDropdown = document.getElementById('notif-dropdown');
      if (notifDropdown && !notifDropdown.classList.contains('hidden') && !e.target.closest('#notif-dropdown')) {
        notifDropdown.classList.add('hidden');
      }

      const mailBtn = e.target.closest('#email-hub-btn');
      if (mailBtn) {
        document.getElementById('email-modal').classList.remove('hidden');
        this.renderEmailModalList();
        return;
      }
    });
  }

  render() {
    const currentUser = store.getCurrentUser();
    
    if (!currentUser) {
      this.renderLoginScreen();
      return;
    }
    
    if (this.activeTab === 'admin-users' && currentUser.role !== 'admin') {
      this.activeTab = 'dashboard';
    }

    this.renderShell();
    this.renderHeader();
    this.renderSidebar();
    
    switch (this.activeTab) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'tickets':
        this.renderTicketsList();
        break;
      case 'ticket-details':
        this.renderTicketDetails();
        break;
      case 'faq':
        this.renderFAQDirectory();
        break;
      case 'admin-users':
        this.renderAdminUsers();
        break;
      case 'create-ticket':
        this.renderCreateTicket();
        break;
    }
  }

  renderLoginScreen() {
    const appEl = document.getElementById('app');
    appEl.dataset.initialized = ""; // Reset shell initialized flag
    
    appEl.innerHTML = `
      <div class="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans relative overflow-hidden p-4">
        <!-- Ambient Glow Blobs -->
        <div class="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-950/15 blur-[120px] pointer-events-none"></div>
        
        <div class="z-10 w-full max-w-md space-y-6">
          <!-- Logo & Header -->
          <div class="text-center space-y-3">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-2xl shadow-xl shadow-indigo-500/20 mx-auto">A</div>
            <div class="space-y-1">
              <h1 class="font-extrabold text-3xl tracking-tight bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">AuraTick Portal</h1>
              <p class="text-xs text-indigo-400 tracking-wider font-semibold uppercase">Enterprise Service Desk Login</p>
            </div>
          </div>
          
          <!-- Glassmorphic Login Card -->
          <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-8 glass-card shadow-2xl space-y-6">
            <form id="login-form" class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username or Email</label>
                <input type="text" id="login-username" placeholder="e.g. e.chen@company.com" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition" required>
              </div>
              
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <input type="password" id="login-password" placeholder="••••••••" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition" required>
              </div>
              
              <div id="login-error" class="text-rose-400 text-xs font-semibold hidden bg-rose-500/5 border border-rose-500/10 rounded-lg p-2.5"></div>
              
              <button type="submit" class="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-indigo-500/20 transition mt-2">
                Sign In to Console
              </button>
            </form>
          </div>
          
          <!-- Collapsible Demo Accounts helper card -->
          <div class="bg-slate-900/20 border border-white/5 rounded-2xl overflow-hidden glass-card transition-all duration-300">
            <button id="demo-acc-toggle" class="w-full px-5 py-3 flex items-center justify-between text-left text-xs font-semibold text-slate-300 hover:bg-white/5 transition">
              <span class="flex items-center gap-2">💡 <span>Available Demo Accounts</span></span>
              <svg id="demo-acc-chevron" class="w-4 h-4 text-slate-400 transform transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div id="demo-acc-content" class="px-5 py-4 border-t border-white/5 bg-slate-950/40 space-y-3 hidden text-[11px] leading-relaxed">
              <div class="space-y-1">
                <p class="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Standard Users</p>
                <div class="flex justify-between border-b border-white/5 pb-1">
                  <span class="text-indigo-400 font-mono">e.chen@company.com</span>
                  <span class="text-slate-500">pwd: password123</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-indigo-400 font-mono">m.vance@company.com</span>
                  <span class="text-slate-500">pwd: password123</span>
                </div>
              </div>
              <div class="space-y-1">
                <p class="font-bold text-slate-300 uppercase tracking-wider text-[10px] mt-2">IT Support Technicians</p>
                <div class="flex justify-between border-b border-white/5 pb-1">
                  <span class="text-indigo-400 font-mono">a.rivera@company.com</span>
                  <span class="text-slate-500">pwd: password123</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-indigo-400 font-mono">j.blake@company.com</span>
                  <span class="text-slate-500">pwd: password123</span>
                </div>
              </div>
              <div class="space-y-1">
                <p class="font-bold text-slate-300 uppercase tracking-wider text-[10px] mt-2">IT Administrator</p>
                <div class="flex justify-between">
                  <span class="text-indigo-400 font-mono">s.jenkins@company.com</span>
                  <span class="text-slate-500">pwd: password123</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const userVal = document.getElementById('login-username').value;
      const passVal = document.getElementById('login-password').value;
      const errEl = document.getElementById('login-error');
      
      try {
        store.login(userVal, passVal);
      } catch (err) {
        errEl.textContent = err.message;
        errEl.classList.remove('hidden');
      }
    });
    
    document.getElementById('demo-acc-toggle').addEventListener('click', () => {
      const content = document.getElementById('demo-acc-content');
      const chevron = document.getElementById('demo-acc-chevron');
      const isCollapsed = content.classList.contains('hidden');
      
      if (isCollapsed) {
        content.classList.remove('hidden');
        chevron.classList.add('rotate-180');
      } else {
        content.classList.add('hidden');
        chevron.classList.remove('rotate-180');
      }
    });
  }

  renderShell() {
    const appEl = document.getElementById('app');
    if (appEl.dataset.initialized) return;

    appEl.innerHTML = `
      <div class="min-h-screen flex flex-col md:flex-row text-slate-100 bg-slate-950 font-sans relative overflow-x-hidden">
        <div class="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-950/25 blur-[120px] pointer-events-none"></div>
        
        <aside id="sidebar-container" class="w-full md:w-64 border-r border-white/5 bg-slate-900/60 backdrop-blur-xl md:flex md:flex-col shrink-0"></aside>

        <main class="flex-1 flex flex-col min-w-0 z-10">
          <header id="header-container" class="h-16 border-b border-white/5 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0"></header>
          <div id="view-container" class="flex-1 overflow-y-auto p-6 space-y-6"></div>
        </main>
      </div>

      <div id="email-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 hidden">
        <div class="bg-slate-900 border border-white/10 w-full max-w-4xl h-[80vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden glass-card">
          <div class="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <h3 class="font-bold text-lg text-white">Simulated Outbox & Notification Logs</h3>
                <p class="text-xs text-slate-400">Review simulated emails sent by the ticketing database</p>
              </div>
            </div>
            <button onclick="document.getElementById('email-modal').classList.add('hidden')" class="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="flex-1 flex min-h-0">
            <div class="w-1/3 border-r border-white/5 overflow-y-auto" id="email-list-pane"></div>
            <div class="w-2/3 overflow-y-auto bg-slate-950/40" id="email-view-pane"></div>
          </div>
        </div>
      </div>

      <div id="feedback-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 hidden">
        <div class="bg-slate-900 border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl glass-card text-center space-y-6">
          <div class="space-y-2">
            <h3 class="font-bold text-xl text-white">Rate IT Support Resolution</h3>
            <p class="text-xs text-slate-400">Help us improve by providing feedback on your technical experience</p>
          </div>
          
          <div class="flex justify-center gap-2" id="star-selector-container"></div>

          <div class="flex flex-wrap gap-2 justify-center" id="feedback-tags-container">
            <button type="button" class="tag-btn px-3 py-1.5 rounded-full border border-white/5 text-xs bg-white/5 hover:bg-indigo-600/20 hover:border-indigo-500 transition" data-tag="Fast Resolution">⚡ Fast Resolution</button>
            <button type="button" class="tag-btn px-3 py-1.5 rounded-full border border-white/5 text-xs bg-white/5 hover:bg-indigo-600/20 hover:border-indigo-500 transition" data-tag="Excellent Service">💎 Excellent Service</button>
            <button type="button" class="tag-btn px-3 py-1.5 rounded-full border border-white/5 text-xs bg-white/5 hover:bg-indigo-600/20 hover:border-indigo-500 transition" data-tag="Clear Communication">🗣️ Clear Communication</button>
            <button type="button" class="tag-btn px-3 py-1.5 rounded-full border border-white/5 text-xs bg-white/5 hover:bg-indigo-600/20 hover:border-indigo-500 transition" data-tag="Tech Expertise">🧠 Tech Expertise</button>
          </div>

          <textarea id="feedback-comments" rows="3" placeholder="Additional comments or recommendations..." class="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition resize-none"></textarea>

          <div class="flex gap-3">
            <button id="submit-feedback-btn" class="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl py-3 text-sm font-semibold shadow-lg hover:shadow-indigo-500/20 transition">Submit Review</button>
            <button onclick="document.getElementById('feedback-modal').classList.add('hidden')" class="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl py-3 text-sm font-semibold transition">Skip</button>
          </div>
        </div>
      </div>
    `;
    appEl.dataset.initialized = "true";
  }

  renderHeader() {
    const container = document.getElementById('header-container');
    const currentUser = store.getCurrentUser();
    
    const notifications = store.getNotifications().filter(n => n.userId === currentUser.id);
    const unreadCount = notifications.filter(n => !n.read).length;

    container.innerHTML = `
      <div class="relative w-72 hidden md:block">
        <svg class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <input type="text" id="global-search" placeholder="Search support system..." class="w-full bg-slate-900/60 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition">
      </div>

      <div class="flex items-center gap-4 ml-auto md:ml-0">
        <button id="email-hub-btn" class="relative p-2 rounded-xl bg-slate-900/60 border border-white/5 hover:bg-slate-800 transition text-slate-300 hover:text-white" title="Simulated Outbox">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          <span class="absolute top-1 right-1 w-2.5 h-2.5 bg-violet-500 rounded-full animate-ping"></span>
          <span class="absolute top-1 right-1 w-2.5 h-2.5 bg-violet-500 rounded-full"></span>
        </button>

        <div class="relative">
          <button id="notif-bell-btn" class="p-2 rounded-xl bg-slate-900/60 border border-white/5 hover:bg-slate-800 transition text-slate-300 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            ${unreadCount > 0 ? `<span class="absolute -top-1 -right-1 bg-indigo-600 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">${unreadCount}</span>` : ''}
          </button>
          
          <div id="notif-dropdown" class="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 space-y-3 z-50 glass-card hidden">
            <div class="flex items-center justify-between border-b border-white/5 pb-2">
              <h4 class="font-bold text-sm text-white">In-App Alerts</h4>
              ${unreadCount > 0 ? `<button id="mark-all-read-btn" class="text-xs text-indigo-400 hover:text-indigo-300 transition">Mark all read</button>` : ''}
            </div>
            <div class="max-h-60 overflow-y-auto space-y-2" id="notif-list">
              ${notifications.length === 0 ? '<p class="text-xs text-slate-500 text-center py-4">No recent alerts</p>' : ''}
              ${notifications.map(n => `
                <div class="p-2.5 rounded-xl text-xs flex gap-2 transition hover:bg-white/5 ${n.read ? 'opacity-60' : 'bg-indigo-600/5 border border-indigo-500/10'}" data-notif-id="${n.id}">
                  <span class="mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${n.isUrgent ? 'bg-rose-500' : 'bg-indigo-400'}"></span>
                  <div class="space-y-1">
                    <p class="text-slate-200 leading-snug">${n.message}</p>
                    <span class="text-[10px] text-slate-500">${this.formatRelativeTime(n.timestamp)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="h-8 w-px bg-white/10"></div>
        <div class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-semibold text-white leading-none">${currentUser.name}</p>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${currentUser.role}</span>
          </div>
          <img src="${currentUser.avatar}" alt="Avatar" class="w-8 h-8 rounded-lg object-cover border border-white/10">
        </div>
      </div>
    `;

    const markAllBtn = document.getElementById('mark-all-read-btn');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => {
        const notifs = store.getNotifications();
        notifs.forEach(n => {
          if (n.userId === currentUser.id) n.read = true;
        });
        store.saveNotifications(notifs);
      });
    }

    const searchInput = document.getElementById('global-search');
    if (searchInput) {
      searchInput.value = this.searchQuery;
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        if (this.activeTab !== 'tickets') {
          this.activeTab = 'tickets';
        }
        this.render();
      });
    }
  }

  renderSidebar() {
    const container = document.getElementById('sidebar-container');
    const currentUser = store.getCurrentUser();

    container.innerHTML = `
      <div class="h-16 flex items-center px-6 border-b border-white/5 gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">A</div>
        <span class="font-bold text-lg text-white bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">AuraTick</span>
        <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest ml-auto">v1.2</span>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-1">
        <button data-tab="dashboard" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${this.activeTab === 'dashboard' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"></path></svg>
          Console Overview
        </button>

        <button data-tab="tickets" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${this.activeTab === 'tickets' || this.activeTab === 'ticket-details' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          Support Tickets
        </button>

        ${currentUser.role === 'user' ? `
          <button data-tab="create-ticket" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${this.activeTab === 'create-ticket' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            File New Issue
          </button>
        ` : ''}

        <button data-tab="faq" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${this.activeTab === 'faq' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Knowledge Directory
        </button>

        ${currentUser.role === 'admin' ? `
          <button data-tab="admin-users" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${this.activeTab === 'admin-users' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Identity Registry
          </button>
        ` : ''}
      </nav>

      <div class="p-4 border-t border-white/5 mt-auto space-y-3">
        <div class="p-3 bg-white/5 rounded-2xl flex items-center gap-3 border border-white/5">
          <img src="${currentUser.avatar}" alt="Avatar" class="w-9 h-9 rounded-xl border border-white/10 object-cover">
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-white truncate leading-tight">${currentUser.name}</p>
            <p class="text-[10px] text-indigo-400 truncate leading-none mt-0.5">${currentUser.email}</p>
          </div>
        </div>
        <button id="sidebar-logout-btn" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Sign Out
        </button>
      </div>
    `;
  }

  renderDashboard() {
    const viewContainer = document.getElementById('view-container');
    const currentUser = store.getCurrentUser();
    const tickets = store.getTickets();

    let filteredTickets = tickets;
    if (currentUser.role === 'user') {
      filteredTickets = tickets.filter(t => t.creatorId === currentUser.id);
    } else if (currentUser.role === 'technician') {
      filteredTickets = tickets.filter(t => t.assigneeId === currentUser.id || t.status === 'Open');
    }

    const openCount = filteredTickets.filter(t => t.status === 'Open').length;
    const progressCount = filteredTickets.filter(t => t.status === 'In Progress').length;
    const resolvedCount = filteredTickets.filter(t => t.status === 'Resolved').length;
    const closedCount = filteredTickets.filter(t => t.status === 'Closed').length;
    
    const activeTickets = filteredTickets.filter(t => t.status === 'Open' || t.status === 'In Progress');
    const criticalCount = activeTickets.filter(t => t.priority === 'Critical').length;
    const breachedSlaCount = activeTickets.filter(t => new Date(t.slaDue).getTime() < Date.now()).length;

    const totalSlaCalculable = filteredTickets.filter(t => t.status === 'Closed' || t.status === 'Resolved');
    let slaCompliance = 100;
    if (totalSlaCalculable.length > 0) {
      slaCompliance = Math.round(((totalSlaCalculable.length - breachedSlaCount) / totalSlaCalculable.length) * 100);
      if (slaCompliance < 0) slaCompliance = 0;
    }

    const categories = { Network: 0, Hardware: 0, Software: 0, Accounts: 0 };
    filteredTickets.forEach(t => {
      if (categories[t.category] !== undefined) categories[t.category]++;
    });
    const maxVal = Math.max(...Object.values(categories), 1);

    viewContainer.innerHTML = `
      <div class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">System Console</h1>
            <p class="text-sm text-slate-400">Welcome back, ${currentUser.name}. Here is today's IT Operations digest.</p>
          </div>
          ${currentUser.role === 'user' ? `
            <button data-tab="create-ticket" class="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              Raise New Ticket
            </button>
          ` : ''}
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden glass-card flex flex-col justify-between h-32">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Queue: Open</span>
            <span class="text-4xl font-extrabold text-white mt-2">${openCount}</span>
            <div class="w-1.5 h-full bg-sky-500 absolute left-0 top-0"></div>
          </div>
          <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden glass-card flex flex-col justify-between h-32">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress</span>
            <span class="text-4xl font-extrabold text-white mt-2">${progressCount}</span>
            <div class="w-1.5 h-full bg-amber-500 absolute left-0 top-0"></div>
          </div>
          <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden glass-card flex flex-col justify-between h-32">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved</span>
            <span class="text-4xl font-extrabold text-emerald-400 mt-2">${resolvedCount}</span>
            <div class="w-1.5 h-full bg-emerald-500 absolute left-0 top-0"></div>
          </div>
          <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden glass-card flex flex-col justify-between h-32">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">SLA Safe</span>
            <span class="text-4xl font-extrabold text-violet-400 mt-2">${slaCompliance}%</span>
            <div class="w-1.5 h-full bg-violet-500 absolute left-0 top-0"></div>
          </div>
        </div>

        ${criticalCount > 0 || breachedSlaCount > 0 ? `
          <div class="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-xs">
            <div class="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-lg shrink-0">🚨</div>
            <div class="space-y-0.5">
              <h4 class="font-bold text-rose-200">Urgent operational alerts active!</h4>
              <p class="text-rose-400/80">There are currently <strong>${criticalCount}</strong> unresolved Critical tickets and <strong>${breachedSlaCount}</strong> tickets breach of Service Level Agreement schedules.</p>
            </div>
            <button data-tab="tickets" class="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg px-3.5 py-1.5 ml-auto transition">Attend Queue</button>
          </div>
        ` : ''}

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card space-y-6">
              <div class="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 class="font-bold text-lg text-white">Tickets Category Distribution</h3>
                  <p class="text-xs text-slate-400">Proportional load by support business areas</p>
                </div>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-slate-300">Total: ${filteredTickets.length}</span>
              </div>
              
              <div class="space-y-4">
                ${Object.entries(categories).map(([cat, count]) => {
                  const percent = Math.round((count / maxVal) * 100);
                  const colorMap = {
                    Network: 'bg-violet-600',
                    Hardware: 'bg-rose-500',
                    Software: 'bg-sky-500',
                    Accounts: 'bg-amber-500'
                  };
                  return `
                    <div class="space-y-1.5">
                      <div class="flex justify-between text-xs font-semibold">
                        <span class="text-slate-300">${cat}</span>
                        <span class="text-white">${count} (${Math.round((count / (filteredTickets.length || 1)) * 100)}%)</span>
                      </div>
                      <div class="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                        <div class="h-full rounded-full ${colorMap[cat]} transition-all duration-700" style="width: ${percent}%"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card space-y-4">
              <div class="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 class="font-bold text-lg text-white">Recent Operations List</h3>
                  <p class="text-xs text-slate-400">Your queue updates requiring quick status actions</p>
                </div>
                <button data-tab="tickets" class="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition">View Queue</button>
              </div>

              <div class="space-y-3">
                ${filteredTickets.length === 0 ? '<p class="text-xs text-slate-500 text-center py-6">No recent tickets raised.</p>' : ''}
                ${filteredTickets.slice(0, 3).map(ticket => `
                  <div class="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition cursor-pointer" data-ticket-id="${ticket.id}">
                    <div class="space-y-1.5 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-[10px] font-bold text-indigo-400 tracking-wider font-mono">${ticket.id}</span>
                        <span class="w-1.5 h-1.5 rounded-full ${this.getPriorityColor(ticket.priority)}"></span>
                        <span class="text-xs font-semibold text-slate-400">${ticket.category}</span>
                      </div>
                      <h4 class="font-bold text-sm text-white truncate pr-4">${ticket.title}</h4>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${this.getStatusBadgeStyle(ticket.status)}">${ticket.status}</span>
                      <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card space-y-4">
              <div class="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 class="font-bold text-lg text-white">Live Email Notifications</h3>
                  <p class="text-xs text-slate-400">Verification logger for email hooks</p>
                </div>
                <button onclick="document.getElementById('email-modal').classList.remove('hidden');" class="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition">Email Console</button>
              </div>

              <div class="space-y-2.5 max-h-72 overflow-y-auto">
                ${store.getEmails().length === 0 ? '<p class="text-xs text-slate-500 text-center py-6">No emails dispatched yet.</p>' : ''}
                ${store.getEmails().slice(0, 4).map(email => `
                  <div class="p-3 bg-slate-950/60 hover:bg-slate-900 border border-white/5 rounded-xl text-xs space-y-1.5 cursor-pointer no-row-click" onclick="document.getElementById('email-modal').classList.remove('hidden'); document.dispatchEvent(new CustomEvent('view-email', {detail: '${email.id}'}));">
                    <div class="flex justify-between items-center text-[10px]">
                      <span class="text-indigo-400 truncate pr-2 max-w-[120px]">To: ${email.to}</span>
                      <span class="text-slate-500">${this.formatRelativeTime(email.timestamp)}</span>
                    </div>
                    <h5 class="font-bold text-slate-200 truncate">${email.subject}</h5>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card space-y-4">
              <h3 class="font-bold text-lg text-white border-b border-white/5 pb-4">Operations Timeline</h3>
              
              <div class="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                ${filteredTickets.length === 0 ? '<p class="text-xs text-slate-500 text-center py-6">No recent logs</p>' : ''}
                ${this.compileRecentLogs(filteredTickets).slice(0, 5).map(log => `
                  <div class="flex gap-3 text-xs leading-normal">
                    <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                    <div>
                      <p class="text-slate-300 font-semibold"><span class="text-white">${log.user}</span> ${log.action}</p>
                      <span class="text-[10px] text-slate-500">${this.formatRelativeTime(log.timestamp)}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderTicketsList() {
    const viewContainer = document.getElementById('view-container');
    const currentUser = store.getCurrentUser();
    const tickets = store.getTickets();

    let filteredTickets = tickets;
    if (currentUser.role === 'user') {
      filteredTickets = tickets.filter(t => t.creatorId === currentUser.id);
    } else if (currentUser.role === 'technician') {
      filteredTickets = tickets.filter(t => t.assigneeId === currentUser.id || t.status === 'Open');
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filteredTickets = filteredTickets.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.id.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.creatorName.toLowerCase().includes(q)
      );
    }

    if (this.statusFilter !== 'all') {
      filteredTickets = filteredTickets.filter(t => t.status === this.statusFilter);
    }
    if (this.priorityFilter !== 'all') {
      filteredTickets = filteredTickets.filter(t => t.priority === this.priorityFilter);
    }
    if (this.categoryFilter !== 'all') {
      filteredTickets = filteredTickets.filter(t => t.category === this.categoryFilter);
    }

    viewContainer.innerHTML = `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">IT Support Queue</h1>
            <p class="text-sm text-slate-400">Review, query, and progress IT service tickets.</p>
          </div>
          ${currentUser.role === 'user' ? `
            <button data-tab="create-ticket" class="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              Raise New Ticket
            </button>
          ` : ''}
        </div>

        <div class="p-4 bg-slate-900/40 border border-white/5 rounded-2xl glass-card grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div class="relative">
            <svg class="absolute left-3 top-2.5 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" id="list-search" placeholder="Query ID or keyword..." class="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition">
          </div>
          
          <div>
            <select id="filter-status" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition">
              <option value="all" ${this.statusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
              <option value="Open" ${this.statusFilter === 'Open' ? 'selected' : ''}>Open</option>
              <option value="In Progress" ${this.statusFilter === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Resolved" ${this.statusFilter === 'Resolved' ? 'selected' : ''}>Resolved</option>
              <option value="Closed" ${this.statusFilter === 'Closed' ? 'selected' : ''}>Closed</option>
            </select>
          </div>

          <div>
            <select id="filter-priority" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition">
              <option value="all" ${this.priorityFilter === 'all' ? 'selected' : ''}>All Priorities</option>
              <option value="Critical" ${this.priorityFilter === 'Critical' ? 'selected' : ''}>🚨 Critical</option>
              <option value="High" ${this.priorityFilter === 'High' ? 'selected' : ''}>🔴 High</option>
              <option value="Medium" ${this.priorityFilter === 'Medium' ? 'selected' : ''}>🟡 Medium</option>
              <option value="Low" ${this.priorityFilter === 'Low' ? 'selected' : ''}>🟢 Low</option>
            </select>
          </div>

          <div>
            <select id="filter-category" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition">
              <option value="all" ${this.categoryFilter === 'all' ? 'selected' : ''}>All Categories</option>
              <option value="Network" ${this.categoryFilter === 'Network' ? 'selected' : ''}>Network</option>
              <option value="Hardware" ${this.categoryFilter === 'Hardware' ? 'selected' : ''}>Hardware</option>
              <option value="Software" ${this.categoryFilter === 'Software' ? 'selected' : ''}>Software</option>
              <option value="Accounts" ${this.categoryFilter === 'Accounts' ? 'selected' : ''}>Accounts</option>
            </select>
          </div>
        </div>

        <div class="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden glass-card">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-white/5 bg-white/5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  <th class="p-4">Ticket</th>
                  <th class="p-4">Priority / Area</th>
                  <th class="p-4">Requester</th>
                  <th class="p-4">Assigned Engineer</th>
                  <th class="p-4">SLA Deadline</th>
                  <th class="p-4">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                ${filteredTickets.length === 0 ? `
                  <tr>
                    <td colspan="6" class="p-8 text-center text-slate-500">
                      No support tickets match the selected filters.
                    </td>
                  </tr>
                ` : ''}
                ${filteredTickets.map(ticket => {
                  const timeDiff = new Date(ticket.slaDue).getTime() - Date.now();
                  const isBreached = timeDiff < 0;
                  const absDiff = Math.abs(timeDiff);
                  const days = Math.floor(absDiff / (3600000 * 24));
                  const hours = Math.floor((absDiff % (3600000 * 24)) / 3600000);
                  const timeString = isBreached 
                    ? `Breached by ${days > 0 ? `${days}d ` : ''}${hours}h` 
                    : `${days > 0 ? `${days}d ` : ''}${hours}h remaining`;

                  return `
                    <tr class="hover:bg-white/5 transition cursor-pointer" data-ticket-id="${ticket.id}">
                      <td class="p-4 space-y-1">
                        <span class="text-[10px] font-bold text-indigo-400 font-mono tracking-wider">${ticket.id}</span>
                        <h4 class="font-bold text-sm text-slate-100 max-w-[280px] truncate leading-tight">${ticket.title}</h4>
                        <p class="text-[10px] text-slate-500">${this.formatRelativeTime(ticket.createdAt)}</p>
                      </td>
                      <td class="p-4 space-y-1.5">
                        <span class="flex items-center gap-1.5 font-bold">
                          <span class="w-2 h-2 rounded-full ${this.getPriorityColor(ticket.priority)}"></span>
                          <span class="text-slate-300 font-semibold">${ticket.priority}</span>
                        </span>
                        <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">${ticket.category}</span>
                      </td>
                      <td class="p-4">
                        <div class="flex items-center gap-2">
                          <img src="${ticket.creatorAvatar}" alt="Requester" class="w-6 h-6 rounded-lg object-cover">
                          <div>
                            <p class="font-semibold text-slate-200 leading-tight">${ticket.creatorName}</p>
                            <p class="text-[9px] text-slate-500 mt-0.5">${ticket.company || 'N/A'} / ${ticket.department || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td class="p-4">
                        <div class="flex items-center gap-2">
                          <span class="font-semibold ${ticket.assigneeId ? 'text-slate-200' : 'text-slate-500 italic'}">${ticket.assigneeName}</span>
                        </div>
                      </td>
                      <td class="p-4">
                        ${ticket.status === 'Closed' || ticket.status === 'Resolved' ? `
                          <span class="text-[10px] text-slate-500 italic">Resolved</span>
                        ` : `
                          <span class="text-xs font-bold leading-none ${isBreached ? 'text-rose-400' : 'text-indigo-400'}">${timeString}</span>
                          <p class="text-[10px] text-slate-500 mt-1">${new Date(ticket.slaDue).toLocaleDateString()}</p>
                        `}
                      </td>
                      <td class="p-4">
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${this.getStatusBadgeStyle(ticket.status)}">${ticket.status}</span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('list-search').addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderTicketsList();
    });
    document.getElementById('list-search').value = this.searchQuery;

    document.getElementById('filter-status').addEventListener('change', (e) => {
      this.statusFilter = e.target.value;
      this.renderTicketsList();
    });
    document.getElementById('filter-priority').addEventListener('change', (e) => {
      this.priorityFilter = e.target.value;
      this.renderTicketsList();
    });
    document.getElementById('filter-category').addEventListener('change', (e) => {
      this.categoryFilter = e.target.value;
      this.renderTicketsList();
    });
  }

  renderTicketDetails() {
    const viewContainer = document.getElementById('view-container');
    const currentUser = store.getCurrentUser();
    const tickets = store.getTickets();
    const ticket = tickets.find(t => t.id === this.activeTicketId);

    if (!ticket) {
      this.activeTab = 'tickets';
      this.render();
      return;
    }

    const technicians = store.getUsers().filter(u => u.role === 'technician');
    const isOwner = ticket.creatorId === currentUser.id;
    const isStaff = currentUser.role === 'admin' || currentUser.role === 'technician';

    const timeDiff = new Date(ticket.slaDue).getTime() - Date.now();
    const isBreached = timeDiff < 0;
    const absDiff = Math.abs(timeDiff);
    const days = Math.floor(absDiff / (3600000 * 24));
    const hours = Math.floor((absDiff % (3600000 * 24)) / 3600000);
    const timeString = isBreached 
      ? `Breached by ${days > 0 ? `${days}d ` : ''}${hours}h` 
      : `${days > 0 ? `${days}d ` : ''}${hours}h remaining`;

    viewContainer.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center gap-3">
          <button id="detail-back-btn" class="p-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <div class="flex items-center gap-2.5">
              <span class="text-xs font-bold text-indigo-400 font-mono tracking-wider">${ticket.id}</span>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${this.getStatusBadgeStyle(ticket.status)}">${ticket.status}</span>
            </div>
            <h1 class="text-xl md:text-2xl font-bold text-white leading-tight mt-1">${ticket.title}</h1>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card space-y-4">
              <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Issue Description</h3>
              <p class="text-sm text-slate-200 leading-relaxed whitespace-pre-line">${ticket.description}</p>
            </div>

            <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card space-y-4 flex flex-col h-[500px]">
              <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2 shrink-0">IT Support Chat Log</h3>
              
              <div id="chat-messages-container" class="flex-1 overflow-y-auto space-y-4 pr-1">
                ${ticket.chat.length === 0 ? `
                  <div class="text-center py-16 text-slate-500 space-y-2">
                    <p class="text-xs">No chat logs recorded.</p>
                    <p class="text-[10px]">Type a message below to start interactive conversation with the support engineer.</p>
                  </div>
                ` : ''}
                ${ticket.chat.map(msg => {
                  const isSelf = msg.senderId === currentUser.id;
                  return `
                    <div class="flex gap-3 max-w-[85%] ${isSelf ? 'ml-auto flex-row-reverse' : ''}">
                      <img src="${msg.senderAvatar}" alt="Avatar" class="w-8 h-8 rounded-lg object-cover shrink-0">
                      <div class="space-y-1">
                        <div class="flex items-center gap-2 ${isSelf ? 'justify-end' : ''}">
                          <span class="text-[10px] font-bold text-slate-400">${msg.senderName}</span>
                          <span class="text-[9px] text-slate-500">${new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div class="p-3 rounded-2xl text-xs leading-relaxed ${isSelf ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}">
                          ${msg.message}
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              ${ticket.status === 'Closed' ? `
                <div class="p-3 bg-white/5 rounded-xl border border-white/5 text-center text-xs text-slate-400 shrink-0">
                  🔒 Support chat is locked because the ticket has been closed.
                </div>
              ` : `
                <form id="chat-form" class="flex gap-2 shrink-0">
                  <input type="text" id="chat-input" placeholder="Ask questions or upload additional details..." class="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition" required>
                  <button type="submit" class="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-3 shadow-lg shadow-indigo-500/10 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  </button>
                </form>
              `}
            </div>

            <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card space-y-4">
              <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Technical Transition Timeline</h3>
              <div class="space-y-4">
                ${ticket.logs.map(log => `
                  <div class="flex gap-3 text-xs leading-normal">
                    <div class="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0"></div>
                    <div>
                      <p class="text-slate-300 font-semibold"><span class="text-white">${log.user}</span> ${log.action}</p>
                      <span class="text-[10px] text-slate-500">${this.formatRelativeTime(log.timestamp)}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card space-y-4">
              <h3 class="font-bold text-sm text-white border-b border-white/5 pb-2">Ticket State & Operations</h3>
              
              <div class="space-y-2.5">
                ${(ticket.status === 'Open' || ticket.status === 'In Progress') && isStaff ? `
                  <button id="action-progress-btn" class="w-full bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl py-2.5 text-xs font-bold transition">
                    ⚡ Start Investigation (In Progress)
                  </button>
                  <button id="action-resolve-btn" class="w-full bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl py-2.5 text-xs font-bold transition">
                    ✅ Resolve Ticket
                  </button>
                ` : ''}

                ${ticket.status === 'Resolved' && (isOwner || isStaff) ? `
                  <button id="action-close-btn" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-2.5 text-xs font-bold shadow-lg shadow-emerald-500/10 transition">
                    🔒 Close Ticket (Confirm Solution)
                  </button>
                ` : ''}

                ${(ticket.status === 'Open' || ticket.status === 'In Progress') && (isOwner || currentUser.role === 'admin') ? `
                  <button id="action-close-btn" class="w-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 rounded-xl py-2.5 text-xs font-bold transition">
                    🛑 Close Ticket
                  </button>
                ` : ''}

                ${ticket.status === 'Closed' && (isOwner || isStaff) ? `
                  <button id="action-reopen-btn" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 text-xs font-bold shadow-lg shadow-indigo-500/10 transition">
                    🔄 Reopen Ticket (Issue Unresolved)
                  </button>
                ` : ''}
              </div>
            </div>

            <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card space-y-4">
              <h3 class="font-bold text-sm text-white border-b border-white/5 pb-2">Properties</h3>
              
              <div class="space-y-4 text-xs">
                <div>
                  <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Requester Profile</label>
                  <div class="flex items-center gap-2">
                    <img src="${ticket.creatorAvatar}" alt="Creator" class="w-8 h-8 rounded-lg object-cover">
                    <div>
                      <p class="font-bold text-slate-200 leading-tight">${ticket.creatorName}</p>
                      <p class="text-[10px] text-slate-500 leading-none">Creator</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Audited Company</label>
                  <span class="font-semibold text-slate-300">${ticket.company || 'N/A'}</span>
                </div>

                <div>
                  <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Audited Department</label>
                  <span class="font-semibold text-slate-300">${ticket.department || 'N/A'}</span>
                </div>

                <div>
                  <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Assigned Engineer</label>
                  ${currentUser.role === 'admin' ? `
                    <div class="relative">
                      <select id="assign-technician-select" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition">
                        <option value="unassigned" ${!ticket.assigneeId ? 'selected' : ''}>Unassigned</option>
                        ${technicians.map(tech => `
                          <option value="${tech.id}" ${ticket.assigneeId === tech.id ? 'selected' : ''}>${tech.name}</option>
                        `).join('')}
                      </select>
                    </div>
                  ` : `
                    <span class="font-semibold text-slate-300">${ticket.assigneeName}</span>
                  `}
                </div>

                <div>
                  <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Priority Level</label>
                  ${isStaff ? `
                    <div class="relative">
                      <select id="update-priority-select" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition">
                        <option value="Critical" ${ticket.priority === 'Critical' ? 'selected' : ''}>🚨 Critical</option>
                        <option value="High" ${ticket.priority === 'High' ? 'selected' : ''}>🔴 High</option>
                        <option value="Medium" ${ticket.priority === 'Medium' ? 'selected' : ''}>🟡 Medium</option>
                        <option value="Low" ${ticket.priority === 'Low' ? 'selected' : ''}>🟢 Low</option>
                      </select>
                    </div>
                  ` : `
                    <span class="flex items-center gap-1.5 font-bold">
                      <span class="w-2 h-2 rounded-full ${this.getPriorityColor(ticket.priority)}"></span>
                      <span class="text-slate-300 font-semibold">${ticket.priority}</span>
                    </span>
                  `}
                </div>

                <div>
                  <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Business Support Area</label>
                  <span class="font-bold text-slate-300 uppercase tracking-widest text-[10px] bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">${ticket.category}</span>
                </div>

                <div>
                  <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Resolution SLA</label>
                  ${ticket.status === 'Closed' || ticket.status === 'Resolved' ? `
                    <span class="text-slate-500 italic">Resolved</span>
                  ` : `
                    <span class="font-bold ${isBreached ? 'text-rose-400' : 'text-indigo-400'}">${timeString}</span>
                    <p class="text-[9px] text-slate-500 mt-0.5">SLA due: ${new Date(ticket.slaDue).toLocaleString()}</p>
                  `}
                </div>
              </div>
            </div>

            ${ticket.status === 'Closed' && ticket.rating ? `
              <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card space-y-4">
                <h3 class="font-bold text-sm text-white border-b border-white/5 pb-2">Customer Feedback Review</h3>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center gap-1 text-amber-400 font-bold">
                    ${'★'.repeat(ticket.rating)}${'☆'.repeat(5-ticket.rating)}
                    <span class="text-white ml-1">(${ticket.rating}/5)</span>
                  </div>
                  <p class="text-slate-300 italic">"${ticket.feedback || 'No comments left.'}"</p>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    const chatContainer = document.getElementById('chat-messages-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    document.getElementById('detail-back-btn').addEventListener('click', () => {
      this.activeTab = 'tickets';
      this.activeTicketId = null;
      this.render();
    });

    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        if (!input.value.trim()) return;
        store.addChatMessage(ticket.id, input.value.trim());
        input.value = '';
      });
    }

    const assignSelect = document.getElementById('assign-technician-select');
    if (assignSelect) {
      assignSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val !== 'unassigned') {
          store.assignTicket(ticket.id, val);
        }
      });
    }

    const prioritySelect = document.getElementById('update-priority-select');
    if (prioritySelect) {
      prioritySelect.addEventListener('change', (e) => {
        store.updateTicketPriority(ticket.id, e.target.value);
      });
    }

    const progressBtn = document.getElementById('action-progress-btn');
    if (progressBtn) {
      progressBtn.addEventListener('click', () => {
        store.updateTicketStatus(ticket.id, 'In Progress');
      });
    }

    const resolveBtn = document.getElementById('action-resolve-btn');
    if (resolveBtn) {
      resolveBtn.addEventListener('click', () => {
        store.updateTicketStatus(ticket.id, 'Resolved');
      });
    }

    const reopenBtn = document.getElementById('action-reopen-btn');
    if (reopenBtn) {
      reopenBtn.addEventListener('click', () => {
        store.reopenTicket(ticket.id);
      });
    }

    const closeBtn = document.getElementById('action-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.openFeedbackModal(ticket.id);
      });
    }
  }

  renderFAQDirectory() {
    const viewContainer = document.getElementById('view-container');
    const faqs = store.getFaqs();

    let filteredFaqs = faqs;
    if (this.faqSearchQuery) {
      const q = this.faqSearchQuery.toLowerCase();
      filteredFaqs = faqs.filter(faq => 
        faq.title.toLowerCase().includes(q) || 
        faq.summary.toLowerCase().includes(q) || 
        faq.content.toLowerCase().includes(q)
      );
    }

    viewContainer.innerHTML = `
      <div class="space-y-6">
        <div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">Knowledge & FAQs Directory</h1>
          <p class="text-sm text-slate-400">Search guides and fixes for immediate self-service troubleshooting.</p>
        </div>

        <div class="relative w-full max-w-xl">
          <svg class="absolute left-4 top-3 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input type="text" id="faq-search" placeholder="Type keywords e.g. wifi, VPN, password..." class="w-full bg-slate-900/60 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition">
        </div>

        <div class="space-y-4 max-w-3xl">
          ${filteredFaqs.length === 0 ? `
            <p class="text-xs text-slate-500 py-12 text-center">No knowledge guides match your query keywords.</p>
          ` : ''}
          ${filteredFaqs.map(faq => `
            <div class="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden glass-card transition-all duration-300">
              <button class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition faq-accordion-header" data-faq-id="${faq.id}">
                <div class="space-y-1 pr-6">
                  <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">${faq.category}</span>
                  <h3 class="font-bold text-white text-base mt-1.5">${faq.title}</h3>
                  <p class="text-xs text-slate-400 leading-relaxed">${faq.summary}</p>
                </div>
                <svg class="w-5 h-5 text-slate-400 shrink-0 transform transition-transform duration-300 accordion-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div class="px-6 py-4 border-t border-white/5 bg-slate-950/40 text-xs text-slate-300 leading-relaxed hidden whitespace-pre-line faq-accordion-content">${faq.content}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.querySelectorAll('.faq-accordion-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const item = e.currentTarget;
        const panel = item.nextElementSibling;
        const chevron = item.querySelector('.accordion-chevron');

        const isCollapsed = panel.classList.contains('hidden');
        
        document.querySelectorAll('.faq-accordion-content').forEach(p => p.classList.add('hidden'));
        document.querySelectorAll('.accordion-chevron').forEach(c => c.classList.remove('rotate-180'));

        if (isCollapsed) {
          panel.classList.remove('hidden');
          chevron.classList.add('rotate-180');
        }
      });
    });

    const searchInput = document.getElementById('faq-search');
    searchInput.value = this.faqSearchQuery;
    searchInput.addEventListener('input', (e) => {
      this.faqSearchQuery = e.target.value;
      this.renderFAQDirectory();
      document.getElementById('faq-search').focus();
    });
  }

  renderAdminUsers() {
    const viewContainer = document.getElementById('view-container');
    const users = store.getUsers();

    viewContainer.innerHTML = `
      <div class="space-y-6">
        <div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">Identity & Users Registry</h1>
          <p class="text-sm text-slate-400">Admin-exclusive utility to register users and control credential rosters.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div class="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden glass-card">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="border-b border-white/5 bg-white/5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    <th class="p-4">Staff Member</th>
                    <th class="p-4">Employee ID</th>
                    <th class="p-4">Company</th>
                    <th class="p-4">Department</th>
                    <th class="p-4">Username</th>
                    <th class="p-4">Email</th>
                    <th class="p-4">Access Role</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  ${users.map(u => `
                    <tr class="hover:bg-white/5 transition">
                      <td class="p-4">
                        <div class="flex items-center gap-3">
                          <img src="${u.avatar}" alt="Avatar" class="w-8 h-8 rounded-lg object-cover">
                          <span class="font-bold text-white text-sm">${u.name}</span>
                        </div>
                      </td>
                      <td class="p-4 text-slate-300 font-mono text-[11px]">${u.employeeId || 'N/A'}</td>
                      <td class="p-4 text-slate-300 font-medium">${u.company || 'N/A'}</td>
                      <td class="p-4 text-slate-300">${u.department || 'N/A'}</td>
                      <td class="p-4 font-mono text-[11px] text-indigo-400">${u.username}</td>
                      <td class="p-4 text-slate-300">${u.email}</td>
                      <td class="p-4">
                        <span class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest ${
                          u.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          u.role === 'technician' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }">${u.role}</span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card space-y-4">
            <h3 class="font-bold text-white text-base border-b border-white/5 pb-2">Register New User Account</h3>
            
            <form id="create-user-form" class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                <input type="text" id="new-user-name" placeholder="e.g. John Doe" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition" required>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username</label>
                <input type="text" id="new-user-username" placeholder="e.g. j.doe" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition" required>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <input type="email" id="new-user-email" placeholder="e.g. j.doe@company.com" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition" required>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee ID</label>
                <input type="text" id="new-user-empid" placeholder="e.g. EMP-1002" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition" required>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company</label>
                <select id="new-user-company" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition">
                  <option value="Emirates Reem Investments PJSC">Emirates Reem Investments PJSC</option>
                  <option value="ERC Holdings">ERC Holdings</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</label>
                <select id="new-user-dept" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition">
                  <option value="IT Support">IT Support</option>
                  <option value="IT Infrastructure">IT Infrastructure</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Role</label>
                <select id="new-user-role" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition">
                  <option value="user">User (Standard Employee)</option>
                  <option value="technician">Technician (IT Support Agent)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>

              <button type="submit" class="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl py-2.5 text-xs font-semibold shadow-lg shadow-indigo-500/10 transition mt-2">
                Generate Secure Login Credentials
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    const form = document.getElementById('create-user-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('new-user-name').value;
      const username = document.getElementById('new-user-username').value;
      const email = document.getElementById('new-user-email').value;
      const role = document.getElementById('new-user-role').value;
      const employeeId = document.getElementById('new-user-empid').value;
      const company = document.getElementById('new-user-company').value;
      const department = document.getElementById('new-user-dept').value;

      try {
        store.createUser(username, name, email, role, employeeId, company, department);
        alert(`Account created successfully for ${name}!\n\nStandard Password: password123`);
        this.renderAdminUsers();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  renderCreateTicket() {
    const viewContainer = document.getElementById('view-container');
    const currentUser = store.getCurrentUser();

    viewContainer.innerHTML = `
      <div class="space-y-6">
        <div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">File IT Service Request</h1>
          <p class="text-sm text-slate-400">Describe your issue in detail. AuraTick scans for instant fixes as you type!</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div class="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card">
            <form id="create-ticket-form" class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issue Header / Title</label>
                <input type="text" id="ticket-title" placeholder="Describe the issue in a few words (e.g. Cannot log in to VPN)" class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition" required>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support Area Category</label>
                  <select id="ticket-category" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition">
                    <option value="Network">Network & Wi-Fi</option>
                    <option value="Hardware">Hardware & Workspace</option>
                    <option value="Software">Software & Licenses</option>
                    <option value="Accounts">Identity & Credentials</option>
                  </select>
                </div>

                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Urgency Priority</label>
                  <select id="ticket-priority" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition">
                    <option value="Low">Low (General Query)</option>
                    <option value="Medium" selected>Medium (Standard Incident)</option>
                    <option value="High">High (Disruptive Issue)</option>
                    <option value="Critical">Critical (Complete Work Block)</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company</label>
                  <select id="ticket-company" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition">
                    <option value="Emirates Reem Investments PJSC" ${currentUser.company === 'Emirates Reem Investments PJSC' ? 'selected' : ''}>Emirates Reem Investments PJSC</option>
                    <option value="ERC Holdings" ${currentUser.company === 'ERC Holdings' ? 'selected' : ''}>ERC Holdings</option>
                  </select>
                </div>

                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</label>
                  <select id="ticket-department" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition">
                    <option value="IT Support" ${currentUser.department === 'IT Support' ? 'selected' : ''}>IT Support</option>
                    <option value="IT Infrastructure" ${currentUser.department === 'IT Infrastructure' ? 'selected' : ''}>IT Infrastructure</option>
                    <option value="Finance" ${currentUser.department === 'Finance' ? 'selected' : ''}>Finance</option>
                    <option value="HR" ${currentUser.department === 'HR' ? 'selected' : ''}>HR</option>
                    <option value="Marketing" ${currentUser.department === 'Marketing' ? 'selected' : ''}>Marketing</option>
                    <option value="Operations" ${currentUser.department === 'Operations' ? 'selected' : ''}>Operations</option>
                  </select>
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detailed Context / Error Logs</label>
                <textarea id="ticket-description" rows="5" placeholder="Include step-by-step actions that caused the issue, exact error messages shown, and any troubleshooting already performed." class="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none" required></textarea>
              </div>

              <div class="p-3 bg-white/5 border border-white/5 rounded-xl text-xs flex justify-between items-center" id="ticket-form-sla-indicator">
                <span class="text-slate-400">Resolution Commitment:</span>
                <span class="font-bold text-indigo-400 font-mono text-[11px]" id="sla-val">SLA Resolution Plan: Within 24 hours</span>
              </div>

              <button type="submit" class="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-indigo-500/20 transition">
                Submit Support Incident Ticket
              </button>
            </form>
          </div>

          <div class="bg-slate-900/40 border border-white/5 rounded-2xl p-6 glass-card space-y-4" id="smart-faq-pane">
            <h3 class="font-bold text-sm text-white border-b border-white/5 pb-2">Smart Self-Service Solutions</h3>
            <p class="text-xs text-slate-400 leading-normal" id="smart-faq-intro">Start typing in the issue title to see matching fix guides before submitting a ticket!</p>
            <div class="space-y-3" id="smart-faq-results"></div>
          </div>
        </div>
      </div>
    `;

    const prioritySel = document.getElementById('ticket-priority');
    const slaIndicator = document.getElementById('sla-val');
    prioritySel.addEventListener('change', () => {
      const v = prioritySel.value;
      const hours = { Critical: '2 hours', High: '8 hours', Medium: '24 hours', Low: '48 hours' };
      slaIndicator.textContent = `SLA Resolution Plan: Within ${hours[v]}`;
    });

    const titleInput = document.getElementById('ticket-title');
    titleInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const resultsPane = document.getElementById('smart-faq-results');
      const introText = document.getElementById('smart-faq-intro');

      if (q.length < 3) {
        resultsPane.innerHTML = '';
        introText.innerHTML = 'Start typing in the issue title to see matching fix guides before submitting a ticket!';
        return;
      }

      const faqs = store.getFaqs();
      const matches = faqs.filter(f => 
        f.title.toLowerCase().includes(q) || 
        f.summary.toLowerCase().includes(q) ||
        f.content.toLowerCase().includes(q) ||
        q.split(' ').some(word => word.length > 2 && f.title.toLowerCase().includes(word))
      );

      if (matches.length === 0) {
        resultsPane.innerHTML = '<p class="text-[10px] text-slate-500 py-4 text-center">No self-help articles matched. Our support team will investigate.</p>';
        introText.innerHTML = 'No matches found. Submit the ticket to get agent assistance.';
      } else {
        introText.innerHTML = '💡 We found these potential guides that could solve your issue immediately:';
        resultsPane.innerHTML = matches.map(faq => `
          <div class="p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl space-y-1.5 transition">
            <h4 class="font-bold text-xs text-white leading-snug">${faq.title}</h4>
            <p class="text-[10px] text-slate-400 leading-normal">${faq.summary}</p>
            <div class="text-[10px] text-indigo-400 border-t border-white/5 pt-1.5 mt-1 font-mono whitespace-pre-line hidden" id="self-faq-${faq.id}">${faq.content}</div>
            <button type="button" class="text-[10px] text-indigo-400 font-bold hover:text-indigo-300 transition flex items-center gap-1 inline-block no-row-click" onclick="const p = this.previousElementSibling; p.classList.toggle('hidden'); this.textContent = p.classList.contains('hidden') ? '📖 Read Fix Guide' : '🙈 Hide Fix Guide';">📖 Read Fix Guide</button>
          </div>
        `).join('');
      }
    });

    const form = document.getElementById('create-ticket-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('ticket-title').value.trim();
      const category = document.getElementById('ticket-category').value;
      const priority = document.getElementById('ticket-priority').value;
      const company = document.getElementById('ticket-company').value;
      const department = document.getElementById('ticket-department').value;
      const description = document.getElementById('ticket-description').value.trim();

      const newTkt = store.createTicket(title, description, category, priority, company, department);
      alert(`Incident report ${newTkt.id} created successfully! Assigned to IT dispatch.`);
      
      this.activeTab = 'tickets';
      this.render();
    });
  }

  openFeedbackModal(ticketId) {
    const modal = document.getElementById('feedback-modal');
    modal.classList.remove('hidden');

    this.selectedRating = 5;
    this.renderStarSelector();

    const submitBtn = document.getElementById('submit-feedback-btn');
    const commentBox = document.getElementById('feedback-comments');
    
    document.querySelectorAll('.tag-btn').forEach(btn => {
      btn.classList.remove('bg-indigo-600', 'border-indigo-500', 'text-white');
      btn.classList.add('bg-white/5', 'border-white/5', 'text-slate-300');
    });

    const activeTags = [];
    document.querySelectorAll('.tag-btn').forEach(btn => {
      btn.onclick = (e) => {
        const item = e.currentTarget;
        const tag = item.dataset.tag;
        if (activeTags.includes(tag)) {
          activeTags.splice(activeTags.indexOf(tag), 1);
          item.classList.remove('bg-indigo-600', 'border-indigo-500', 'text-white');
          item.classList.add('bg-white/5', 'border-white/5', 'text-slate-300');
        } else {
          activeTags.push(tag);
          item.classList.add('bg-indigo-600', 'border-indigo-500', 'text-white');
          item.classList.remove('bg-white/5', 'border-white/5', 'text-slate-300');
        }
      };
    });

    submitBtn.onclick = () => {
      const commentStr = commentBox.value.trim();
      const tagsStr = activeTags.join(', ');
      const finalFeedback = [tagsStr, commentStr].filter(s => s).join(' | ');

      store.closeTicket(ticketId, this.selectedRating, finalFeedback);
      modal.classList.add('hidden');
      this.render();
    };
  }

  renderStarSelector() {
    const container = document.getElementById('star-selector-container');
    container.innerHTML = Array.from({length: 5}, (_, i) => {
      const idx = i + 1;
      const isLit = idx <= this.selectedRating;
      return `
        <button type="button" class="text-3xl transition transform hover:scale-110 select-star-btn" data-star-idx="${idx}">
          <span class="${isLit ? 'text-amber-400' : 'text-slate-600'}">★</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.select-star-btn').forEach(btn => {
      btn.onclick = (e) => {
        this.selectedRating = parseInt(e.currentTarget.dataset.starIdx);
        this.renderStarSelector();
      };
    });
  }

  renderEmailModalList() {
    const listPane = document.getElementById('email-list-pane');
    const viewPane = document.getElementById('email-view-pane');
    const emails = store.getEmails();

    if (emails.length === 0) {
      listPane.innerHTML = '<p class="text-xs text-slate-500 text-center py-12">No simulated emails sent yet.</p>';
      viewPane.innerHTML = '<p class="text-xs text-slate-500 text-center py-12">Select an email to view rendered SMTP hooks.</p>';
      return;
    }

    if (!this.selectedEmailId) {
      this.selectedEmailId = emails[0].id;
    }

    listPane.innerHTML = `
      <div class="divide-y divide-white/5">
        ${emails.map(email => `
          <button class="w-full text-left p-4 hover:bg-white/5 transition flex flex-col gap-1.5 ${email.id === this.selectedEmailId ? 'bg-indigo-600/10 border-l-4 border-indigo-500' : ''}" data-email-list-id="${email.id}">
            <div class="flex justify-between items-center text-[10px]">
              <span class="text-slate-400 font-bold">To: ${email.to.split('@')[0]}</span>
              <span class="text-slate-500">${new Date(email.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
            </div>
            <h4 class="font-bold text-xs text-white truncate w-full">${email.subject}</h4>
          </button>
        `).join('')}
      </div>
    `;

    const activeEmail = emails.find(e => e.id === this.selectedEmailId) || emails[0];
    this.selectedEmailId = activeEmail.id;

    viewPane.innerHTML = `
      <div class="p-6 space-y-6">
        <div class="border-b border-white/5 pb-4 space-y-2">
          <div class="flex flex-col text-xs text-slate-400">
            <span><strong>From:</strong> ${activeEmail.from}</span>
            <span><strong>To:</strong> ${activeEmail.to}</span>
            <span><strong>Date:</strong> ${new Date(activeEmail.timestamp).toLocaleString()}</span>
          </div>
          <h2 class="font-extrabold text-white text-lg mt-2">${activeEmail.subject}</h2>
        </div>

        <div class="bg-white text-slate-900 rounded-xl p-6 shadow-inner text-sm leading-relaxed overflow-x-auto min-h-[300px]">
          ${activeEmail.htmlContent}
        </div>
      </div>
    `;

    listPane.querySelectorAll('[data-email-list-id]').forEach(btn => {
      btn.onclick = (e) => {
        const item = e.currentTarget;
        this.selectedEmailId = item.dataset.emailListId;
        this.renderEmailModalList();
      };
    });

    document.removeEventListener('view-email', this.handleViewEmailCustomEvent);
    this.handleViewEmailCustomEvent = (e) => {
      this.selectedEmailId = e.detail;
      this.renderEmailModalList();
    };
    document.addEventListener('view-email', this.handleViewEmailCustomEvent);
  }

  getPriorityColor(priority) {
    const priorityColors = {
      Critical: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
      High: 'bg-rose-500',
      Medium: 'bg-amber-400',
      Low: 'bg-emerald-400'
    };
    return priorityColors[priority] || 'bg-slate-400';
  }

  getStatusBadgeStyle(status) {
    const styles = {
      Open: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
      'In Progress': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      Resolved: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      Closed: 'bg-slate-500/10 text-slate-400 border border-white/5'
    };
    return styles[status] || 'bg-slate-500/10 text-slate-400';
  }

  formatRelativeTime(isoString) {
    const time = new Date(isoString).getTime();
    const now = Date.now();
    const diffSeconds = Math.round((now - time) / 1000);
    
    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(isoString).toLocaleDateString();
  }

  compileRecentLogs(filteredTickets) {
    const allLogs = [];
    filteredTickets.forEach(t => {
      t.logs.forEach(log => {
        allLogs.push({
          ...log,
          ticketId: t.id
        });
      });
    });
    return allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

// ==========================================
// 4. BOOTSTRAP INITIALIZATION
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  const ui = new AuraTickUI();
  ui.init();
});
