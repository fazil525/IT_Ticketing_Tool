import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  // Store database.db in the node_modules directory to prevent Next.js from watching it
  const dbPath = path.join(process.cwd(), 'node_modules', 'database.db');
  
  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enforce foreign key constraints and enable WAL mode for production concurrency
  await dbInstance.exec('PRAGMA foreign_keys = ON;');
  await dbInstance.exec('PRAGMA journal_mode = WAL;');

  // Automatic column migration for notifications and locations
  try {
    await dbInstance.exec('ALTER TABLE notifications ADD COLUMN ticket_id TEXT;');
  } catch (e) {
    // Column already exists, safe to ignore
  }

  try {
    await dbInstance.exec('ALTER TABLE users ADD COLUMN location TEXT;');
  } catch (e) {
    // Column already exists, safe to ignore
  }

  try {
    await dbInstance.exec('ALTER TABLE tickets ADD COLUMN location TEXT;');
  } catch (e) {
    // Column already exists, safe to ignore
  }

  // Automatic creation of corporate infrastructure tables
  try {
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );
    `);
  } catch (e) {
    console.error('Error creating locations table:', e);
  }

  try {
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );
    `);
  } catch (e) {
    console.error('Error creating departments table:', e);
  }

  // Pre-seed default locations if table is empty
  try {
    const locCount = await dbInstance.get('SELECT COUNT(*) as count FROM locations');
    if (locCount.count === 0) {
      const defaultLocs = ['Abu Dhabi (HQ)', 'Dubai Office', 'Sharjah Office', 'Al Ain Branch', 'Khalifa City Hub'];
      for (const loc of defaultLocs) {
        const id = `loc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await dbInstance.run('INSERT INTO locations (id, name) VALUES (?, ?)', [id, loc]);
      }
    }
  } catch (e) {}

  // Pre-seed default departments if table is empty
  try {
    const deptCount = await dbInstance.get('SELECT COUNT(*) as count FROM departments');
    if (deptCount.count === 0) {
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
        await dbInstance.run('INSERT INTO departments (id, name) VALUES (?, ?)', [id, dept]);
      }
    }
  } catch (e) {}

  // Automatic creation of ticket_notes table
  try {
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS ticket_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        note TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
      );
    `);
  } catch (e) {
    console.error('Error creating ticket_notes table:', e);
  }

  return dbInstance;
}

export async function query(sql, params = []) {
  const db = await getDb();
  return db.all(sql, params);
}

export async function get(sql, params = []) {
  const db = await getDb();
  return db.get(sql, params);
}

export async function run(sql, params = []) {
  const db = await getDb();
  return db.run(sql, params);
}

export async function exec(sql) {
  const db = await getDb();
  return db.exec(sql);
}
