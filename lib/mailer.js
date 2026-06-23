import nodemailer from 'nodemailer';
import { supabaseAdmin } from './supabaseAdmin.js';

export async function sendEmail({ from, to, subject, htmlContent }) {
  const timestamp = new Date().toISOString();

  // Log email to Supabase emails table
  try {
    await supabaseAdmin.from('emails').insert({
      from_email: from,
      to_email: to,
      subject,
      html_content: htmlContent,
      timestamp,
      status: 'pending',
    });
  } catch (dbErr) {
    console.error('Failed to log email in Supabase:', dbErr);
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const secure = process.env.SMTP_SECURE === 'true';
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
          rejectUnauthorized: false,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || from,
        to,
        subject,
        html: htmlContent,
      });

      await supabaseAdmin
        .from('emails')
        .update({
          status: 'sent',
        })
        .eq('to_email', to)
        .eq('subject', subject)
        .eq('timestamp', timestamp);

      console.log(`Real SMTP email sent successfully! MessageID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (smtpErr) {
      await supabaseAdmin
        .from('emails')
        .update({
          status: 'failed',
        })
        .eq('to_email', to)
        .eq('subject', subject)
        .eq('timestamp', timestamp);

      console.error('SMTP Dispatch failed. Safe fallback logged. Error:', smtpErr.message);
      return { success: false, error: smtpErr.message };
    }
  }

  console.log(`SMTP environment variables not configured. Logged simulated outbox email for recipient: ${to}`);
  return { success: true, simulated: true };
}