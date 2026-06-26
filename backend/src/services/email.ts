import nodemailer, { Transporter } from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM || 'Octolio <no-reply@octolio.me>';

/**
 * Resend's HTTP API is preferred over SMTP because Render (and several other
 * hosts) silently block outbound TCP on SMTP ports. HTTPS port 443 is always
 * open. The Resend `re_…` API key works for both; we reuse SMTP_PASS when
 * SMTP_HOST points at Resend so no extra env var is needed.
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY
  || (SMTP_HOST === 'smtp.resend.com' && SMTP_PASS?.startsWith('re_') ? SMTP_PASS : undefined);

let transporter: Transporter | null = null;

export function isSmtpConfigured(): boolean {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

export function isEmailConfigured(): boolean {
  return !!RESEND_API_KEY || isSmtpConfigured();
}

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  if (!isSmtpConfigured()) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });
  return transporter;
}

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
}

async function sendViaResendApi({ to, subject, html, text }: SendArgs): Promise<void> {
  console.log(`[email] sending → ${to} (subject: "${subject}") via Resend HTTP API`);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: MAIL_FROM, to, subject, html, text }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API ${res.status}: ${body}`);
  }
  const data = await res.json() as { id?: string };
  console.log(`[email] sent ✓ (resend api) id=${data.id ?? '?'}`);
}

async function sendViaSmtp({ to, subject, html, text }: SendArgs): Promise<void> {
  const t = getTransporter();
  if (!t) throw new Error('SMTP transport unavailable');
  console.log(`[email] sending → ${to} (subject: "${subject}") via ${SMTP_HOST}:${SMTP_PORT}`);
  const info = await t.sendMail({ from: MAIL_FROM, to, subject, html, text });
  console.log(`[email] sent ✓ messageId=${info.messageId} response="${info.response}"`);
}

async function send(args: SendArgs): Promise<void> {
  if (RESEND_API_KEY) {
    await sendViaResendApi(args);
    return;
  }
  if (isSmtpConfigured()) {
    await sendViaSmtp(args);
    return;
  }
  // Dev fallback — no creds at all. Print loudly so the code is easy to spot.
  console.warn('\n========================================');
  console.warn('[email] EMAIL NOT CONFIGURED — email not sent.');
  console.warn('  Set RESEND_API_KEY (preferred) or SMTP_HOST/USER/PASS.');
  console.warn(`  To:      ${args.to}`);
  console.warn(`  Subject: ${args.subject}`);
  console.warn('--- body ---');
  console.warn(args.text);
  console.warn('========================================\n');
}

/* Print email config status at startup so the Render logs make the failure
 * mode obvious in one glance. */
export function logSmtpStatus(): void {
  if (RESEND_API_KEY) {
    console.log(`[email] using Resend HTTP API (from=${MAIL_FROM})`);
    return;
  }
  if (isSmtpConfigured()) {
    console.log(`[email] using SMTP: host=${SMTP_HOST} port=${SMTP_PORT} user=${SMTP_USER} from=${MAIL_FROM}`);
    if (SMTP_HOST === 'smtp.resend.com' && (SMTP_PORT === 465 || SMTP_PORT === 587)) {
      console.warn('[email] WARNING: Render blocks outbound SMTP on common ports (465/587). If sends time out, switch to Resend HTTP API by setting RESEND_API_KEY=<your re_… key> (you can keep or remove SMTP_*).');
    }
    return;
  }
  console.warn('[email] NOT configured — set RESEND_API_KEY (preferred) or SMTP_HOST/USER/PASS. Codes will be logged to console.');
}

// Accept either APP_URL or FRONTEND_URL — both are common conventions.
const APP_URL = process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:5173';

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0a0e1a;color:#e6e8ef;margin:0;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#141a2c;border-radius:16px;padding:32px;border:1px solid #232a40">
    <div style="text-align:center;margin-bottom:24px">
      <h1 style="color:#5fd7a8;margin:0;font-size:22px">Octolio</h1>
    </div>
    <h2 style="color:#fff;font-size:18px;margin:0 0 12px">${title}</h2>
    ${body}
    <p style="color:#8a93ad;font-size:12px;margin-top:32px;text-align:center">If you didn't request this, you can safely ignore this email.</p>
  </div>
</body></html>`;
}

export async function sendVerificationEmail(to: string, name: string, code: string, token: string): Promise<void> {
  const link = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
  const html = shell(
    'Verify your email',
    `<p>Hi ${escapeHtml(name)}, welcome to Octolio! Use the code below to verify your email address:</p>
     <div style="text-align:center;margin:24px 0">
       <div style="display:inline-block;background:#0a0e1a;border:1px solid #2a3148;border-radius:12px;padding:16px 28px;font-size:28px;letter-spacing:6px;font-weight:700;color:#5fd7a8;font-family:ui-monospace,Menlo,monospace">${code}</div>
     </div>
     <p>Or click this link to verify automatically:</p>
     <p style="text-align:center;margin:16px 0">
       <a href="${link}" style="display:inline-block;background:#5fd7a8;color:#0a0e1a;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:10px">Verify email</a>
     </p>
     <p style="color:#8a93ad;font-size:13px">This code expires in 30 minutes.</p>`
  );
  const text = `Welcome to Octolio!\n\nVerify your email with code: ${code}\nOr open: ${link}\n\nThis code expires in 30 minutes.`;
  await send({ to, subject: 'Verify your Octolio email', html, text });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
  const link = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
  const html = shell(
    'Reset your password',
    `<p>Hi ${escapeHtml(name)}, we received a request to reset your Octolio password.</p>
     <p style="text-align:center;margin:24px 0">
       <a href="${link}" style="display:inline-block;background:#5fd7a8;color:#0a0e1a;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:10px">Reset password</a>
     </p>
     <p style="color:#8a93ad;font-size:13px">This link expires in 1 hour.</p>`
  );
  const text = `Reset your Octolio password by opening: ${link}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`;
  await send({ to, subject: 'Reset your Octolio password', html, text });
}

/**
 * Daily streak reminder. Sent by the reminders cron to users who haven't
 * been active today. Bilingual copy based on the user's saved language.
 */
export async function sendStreakReminderEmail(
  to: string,
  name: string,
  streak: number,
  lang: 'en' | 'bg' = 'en'
): Promise<void> {
  const link = `${APP_URL}/modules`;
  const en = {
    subject: streak > 0 ? `🔥 Keep your ${streak}-day streak alive` : '👋 Your daily money lesson is ready',
    title: streak > 0 ? `Don't lose your ${streak}-day streak!` : 'Ready for today?',
    body: streak > 0
      ? `Hi ${escapeHtml(name)}, you're on a <b>${streak}-day streak</b> — one quick lesson (or a 60-second Daily Workout) keeps it going.`
      : `Hi ${escapeHtml(name)}, a 5-minute lesson today builds the habit. Even a 60-second Daily Workout counts.`,
    cta: 'Practice now',
  };
  const bg = {
    subject: streak > 0 ? `🔥 Запази ${streak}-дневната си поредица` : '👋 Дневният ти урок е готов',
    title: streak > 0 ? `Не губи ${streak}-дневната си поредица!` : 'Готов ли си за днес?',
    body: streak > 0
      ? `Здравей ${escapeHtml(name)}, имаш <b>${streak}-дневна поредица</b> — един бърз урок (или 60-секундна Дневна тренировка) я запазва.`
      : `Здравей ${escapeHtml(name)}, 5-минутен урок днес гради навика. Дори 60-секундна Дневна тренировка се брои.`,
    cta: 'Учи сега',
  };
  const t = lang === 'bg' ? bg : en;

  const html = shell(
    t.title,
    `<p>${t.body}</p>
     <p style="text-align:center;margin:24px 0">
       <a href="${link}" style="display:inline-block;background:#5fd7a8;color:#0a0e1a;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:10px">${t.cta} →</a>
     </p>`
  );
  const text = `${t.title}\n\n${t.body.replace(/<[^>]+>/g, '')}\n\n${t.cta}: ${link}`;
  await send({ to, subject: t.subject, html, text });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
