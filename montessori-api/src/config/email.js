import nodemailer from 'nodemailer';
import { env } from './env.js';

let transporter;

export const getMailer = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Send a transactional email.
 * @param {{ to: string, subject: string, html: string, text?: string }} opts
 */
export const sendMail = async ({ to, subject, html, text }) => {
  const mailer = getMailer();
  const info = await mailer.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]+>/g, ''),
  });
  if (env.isDev) {
    console.log('[Email] Sent:', info.messageId, '→', to);
  }
  return info;
};

// ─── Email Templates ──────────────────────────────────────────────────────────

export const emailTemplates = {
  verifyEmail: (name, verifyUrl) => ({
    subject: 'Verify your Montessori Platform email',
    html: `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3E4C8C;">Welcome, ${name}!</h2>
        <p>Please verify your email address to activate your account.</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#3E4C8C;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
          Verify Email
        </a>
        <p style="color:#5B5F6B;font-size:13px;margin-top:24px;">
          This link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
  }),

  resetPassword: (name, resetUrl) => ({
    subject: 'Reset your Montessori Platform password',
    html: `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3E4C8C;">Password Reset Request</h2>
        <p>Hi ${name}, we received a request to reset your password.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#3E4C8C;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
          Reset Password
        </a>
        <p style="color:#5B5F6B;font-size:13px;margin-top:24px;">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  }),

  inviteUser: (inviterName, orgName, role, inviteUrl) => ({
    subject: `You've been invited to join ${orgName} on Montessori Platform`,
    html: `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3E4C8C;">You're Invited!</h2>
        <p>${inviterName} has invited you to join <strong>${orgName}</strong> as a <strong>${role}</strong>.</p>
        <a href="${inviteUrl}" style="display:inline-block;padding:12px 24px;background:#5C7A5A;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
          Accept Invitation
        </a>
        <p style="color:#5B5F6B;font-size:13px;margin-top:24px;">
          This invitation expires in 48 hours.
        </p>
      </div>
    `,
  }),

  attendanceNotification: (parentName, studentName, checkType, time, schoolName) => ({
    subject: `${studentName} has ${checkType === 'CHECK_IN' ? 'arrived at' : 'left'} ${schoolName}`,
    html: `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #5C7A5A;">${checkType === 'CHECK_IN' ? '✅ Arrived' : '👋 Departed'}</h2>
        <p>Hi ${parentName},</p>
        <p><strong>${studentName}</strong> ${checkType === 'CHECK_IN' ? 'checked in to' : 'checked out from'} 
        <strong>${schoolName}</strong> at <strong>${time}</strong>.</p>
      </div>
    `,
  }),
};
