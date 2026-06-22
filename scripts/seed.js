import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';

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
    location: "Abu Dhabi (HQ)",
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
    location: "Dubai Office",
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
    location: "Sharjah Office",
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
    location: "Al Ain Branch",
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
    location: "Khalifa City Hub",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  },
  {
    id: "user-tech-fazil",
    username: "tech.fazil",
    password: "password123",
    name: "Fazil",
    role: "technician",
    email: "fazil@company.com",
    employeeId: "EMP-0010",
    company: "Emirates Reem Investments PJSC",
    department: "IT Support",
    location: "Abu Dhabi (HQ)",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
  },
  {
    id: "user-tech-irfan",
    username: "tech.irfan",
    password: "password123",
    name: "Irfan",
    role: "technician",
    email: "irfan@company.com",
    employeeId: "EMP-0011",
    company: "Emirates Reem Investments PJSC",
    department: "IT Support",
    location: "Dubai Office",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
  },
  {
    id: "user-admin-hakeem",
    username: "admin.hakeem",
    password: "password123",
    name: "Hakeem (IT Manager)",
    role: "admin",
    email: "hakeem@company.com",
    employeeId: "EMP-0012",
    company: "Emirates Reem Investments PJSC",
    department: "IT Support",
    location: "Abu Dhabi (HQ)",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"
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
    location: "Al Ain Branch",
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
    location: "Khalifa City Hub",
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
    location: "Al Ain Branch",
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

async function seed() {
  const dbPath = path.join(process.cwd(), 'node_modules', 'database.db');
  console.log(`Connecting to database at: ${dbPath}`);
  
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  console.log("Dropping tables if they exist...");
  await db.exec(`
    DROP TABLE IF EXISTS emails;
    DROP TABLE IF EXISTS notifications;
    DROP TABLE IF EXISTS logs;
    DROP TABLE IF EXISTS chats;
    DROP TABLE IF EXISTS tickets;
    DROP TABLE IF EXISTS faqs;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS locations;
    DROP TABLE IF EXISTS departments;
    DROP TABLE IF EXISTS ticket_notes;
  `);

  console.log("Creating tables...");
  
  // 1a. Locations table
  await db.exec(`
    CREATE TABLE locations (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    );
  `);

  // 1b. Departments table
  await db.exec(`
    CREATE TABLE departments (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    );
  `);

  // 1. Users table
  await db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      employee_id TEXT,
      company TEXT,
      department TEXT,
      location TEXT,
      avatar TEXT
    );
  `);

  // 2. FAQs table
  await db.exec(`
    CREATE TABLE faqs (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL
    );
  `);

  // 3. Tickets table
  await db.exec(`
    CREATE TABLE tickets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      company TEXT,
      department TEXT,
      location TEXT,
      status TEXT NOT NULL,
      creator_id TEXT NOT NULL,
      assignee_id TEXT,
      created_at TEXT NOT NULL,
      sla_due TEXT NOT NULL,
      rating INTEGER,
      feedback TEXT,
      FOREIGN KEY (creator_id) REFERENCES users(id),
      FOREIGN KEY (assignee_id) REFERENCES users(id)
    );
  `);

  // 4. Chats table
  await db.exec(`
    CREATE TABLE chats (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id)
    );
  `);

  // 5. Logs table
  await db.exec(`
    CREATE TABLE logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
    );
  `);

  // 6. Notifications table
  await db.exec(`
    CREATE TABLE notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      ticket_id TEXT,
      message TEXT NOT NULL,
      is_urgent INTEGER DEFAULT 0,
      read_status INTEGER DEFAULT 0,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
    );
  `);

  // 7. Emails table
  await db.exec(`
    CREATE TABLE emails (
      id TEXT PRIMARY KEY,
      from_email TEXT NOT NULL,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      html_content TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);

  // 8. Ticket Notes table
  await db.exec(`
    CREATE TABLE ticket_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      note TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
    );
  `);

  console.log("Seeding Locations & Departments...");
  const defaultLocs = ['Abu Dhabi (HQ)', 'Dubai Office', 'Sharjah Office', 'Al Ain Branch', 'Khalifa City Hub'];
  for (const loc of defaultLocs) {
    const id = `loc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await db.run('INSERT INTO locations (id, name) VALUES (?, ?)', [id, loc]);
  }

  const defaultDepts = [
    'Information Technology (IT)',
    'Finance & Accounts',
    'Human Resources (HR)',
    'Marketing',
    'Operations',
    'Procurement',
    'Legal'
  ];
  for (const dept of defaultDepts) {
    const id = `dept-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await db.run('INSERT INTO departments (id, name) VALUES (?, ?)', [id, dept]);
  }

  console.log("Seeding Users (with Bcrypt password hashing)...");
  const insertUser = await db.prepare(`
    INSERT INTO users (id, username, password, name, role, email, employee_id, company, department, location, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const u of INITIAL_USERS) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    await insertUser.run(u.id, u.username, u.password ? hashedPassword : '', u.name, u.role, u.email, u.employeeId, u.company, u.department, u.location, u.avatar);
  }
  await insertUser.finalize();

  console.log("Seeding FAQs...");
  const insertFaq = await db.prepare(`
    INSERT INTO faqs (id, category, title, summary, content)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const f of INITIAL_FAQS) {
    await insertFaq.run(f.id, f.category, f.title, f.summary, f.content);
  }
  await insertFaq.finalize();

  console.log("Seeding Tickets, Chat messages, and Audit Logs...");
  const insertTicket = await db.prepare(`
    INSERT INTO tickets (id, title, description, category, priority, company, department, location, status, creator_id, assignee_id, created_at, sla_due, rating, feedback)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertChat = await db.prepare(`
    INSERT INTO chats (id, ticket_id, sender_id, message, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertLog = await db.prepare(`
    INSERT INTO logs (ticket_id, user_name, action, timestamp)
    VALUES (?, ?, ?, ?)
  `);

  for (const t of INITIAL_TICKETS) {
    await insertTicket.run(t.id, t.title, t.description, t.category, t.priority, t.company, t.department, t.location, t.status, t.creatorId, t.assigneeId, t.createdAt, t.slaDue, t.rating, t.feedback);

    // Seed chats
    if (t.chat && t.chat.length > 0) {
      for (const c of t.chat) {
        await insertChat.run(c.id, t.id, c.senderId, c.message, c.timestamp);
      }
    }

    // Seed logs
    if (t.logs && t.logs.length > 0) {
      for (const l of t.logs) {
        await insertLog.run(t.id, l.user, l.action, l.timestamp);
      }
    }
  }

  await insertTicket.finalize();
  await insertChat.finalize();
  await insertLog.finalize();

  // Seed sample email notification and in-app notifications
  console.log("Seeding initial emails & notifications...");
  await db.run(`
    INSERT INTO notifications (id, user_id, ticket_id, message, is_urgent, read_status, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, 'notif-1', 'user-admin', 'TKT-8241', 'New high-priority ticket TKT-8241 raised by Emily Chen', 1, 0, new Date(Date.now() - 3600000 * 24).toISOString());

  await db.run(`
    INSERT INTO emails (id, from_email, to_email, subject, html_content, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `, 'email-1', 'support@company.com', 'e.chen@company.com', 'Ticket Received: [TKT-8241] - VPN connection dropping repeatedly', '<h2>Ticket Confirmation</h2><p>Dear Emily Chen,</p><p>We have successfully received your IT support ticket. Our team has been notified.</p>', new Date(Date.now() - 3600000 * 24).toISOString());

  console.log("Database initialized and seeded successfully!");
  await db.close();
}

seed().catch(err => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
