import nodemailer from 'nodemailer';
import { run } from './db.js';

/**
 * Sends a real SMTP email if configured via environment variables, 
 * otherwise logs the email dispatch to the SQLite database simulated outbox logs.
 * 
 * @param {string} from - Sender email address
 * @param {string} to - Recipient email address
 * @param {string} subject - Subject line
 * @param {string} htmlContent - HTML formatted body
 */
export async function sendEmail({ from, to, subject, htmlContent }) {
  const timestamp = new Date().toISOString();
  const emailId = `email-${Date.now()}-${Math.floor(Math.random() * 100)}`;

  // 1. Always record in SQLite email log database table for console visibility
  try {
    await run(
      `INSERT INTO emails (id, from_email, to_email, subject, html_content, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [emailId, from, to, subject, htmlContent, timestamp]
    );
  } catch (dbErr) {
    console.error('Failed to log email in database:', dbErr);
  }

  // 2. Check if SMTP is configured
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const secure = process.env.SMTP_SECURE === 'true'; // true for port 465, false for 587
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    console.log(`SMTP configured. Attempting real email dispatch to ${to} via ${host}:${port}...`);
    try {
      const transporter = nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure,
        auth: {
          user,
          pass,
        },
        tls: {
          // Do not fail on invalid certs (common on internal corporate networks)
          rejectUnauthorized: false
        }
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || from,
        to,
        subject,
        html: htmlContent,
      });

      console.log(`Real SMTP email sent successfully! MessageID: ${info.messageId}`);
    } catch (smtpErr) {
      console.error(`SMTP Dispatch failed. Safe fallback logged. Error:`, smtpErr.message);
    }
  } else {
    console.log(`SMTP environment variables not configured. Logged simulated outbox email for recipient: ${to}`);
  }
}
