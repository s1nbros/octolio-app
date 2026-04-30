"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM || 'Octolio <no-reply@octolio.me>';
let transporter = null;
function getTransporter() {
    if (transporter)
        return transporter;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS)
        return null;
    transporter = nodemailer_1.default.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    return transporter;
}
async function send({ to, subject, html, text }) {
    const t = getTransporter();
    if (!t) {
        // Dev fallback — no SMTP creds, just log so the flow can be tested
        console.warn('[email] SMTP not configured — printing email to console:');
        console.log(`  To: ${to}`);
        console.log(`  From: ${MAIL_FROM}`);
        console.log(`  Subject: ${subject}`);
        console.log(`  Body: ${text}`);
        return;
    }
    await t.sendMail({ from: MAIL_FROM, to, subject, html, text });
}
const APP_URL = process.env.APP_URL || 'http://localhost:5173';
function shell(title, body) {
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
async function sendVerificationEmail(to, name, code, token) {
    const link = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
    const html = shell('Verify your email', `<p>Hi ${escapeHtml(name)}, welcome to Octolio! Use the code below to verify your email address:</p>
     <div style="text-align:center;margin:24px 0">
       <div style="display:inline-block;background:#0a0e1a;border:1px solid #2a3148;border-radius:12px;padding:16px 28px;font-size:28px;letter-spacing:6px;font-weight:700;color:#5fd7a8;font-family:ui-monospace,Menlo,monospace">${code}</div>
     </div>
     <p>Or click this link to verify automatically:</p>
     <p style="text-align:center;margin:16px 0">
       <a href="${link}" style="display:inline-block;background:#5fd7a8;color:#0a0e1a;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:10px">Verify email</a>
     </p>
     <p style="color:#8a93ad;font-size:13px">This code expires in 30 minutes.</p>`);
    const text = `Welcome to Octolio!\n\nVerify your email with code: ${code}\nOr open: ${link}\n\nThis code expires in 30 minutes.`;
    await send({ to, subject: 'Verify your Octolio email', html, text });
}
async function sendPasswordResetEmail(to, name, token) {
    const link = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
    const html = shell('Reset your password', `<p>Hi ${escapeHtml(name)}, we received a request to reset your Octolio password.</p>
     <p style="text-align:center;margin:24px 0">
       <a href="${link}" style="display:inline-block;background:#5fd7a8;color:#0a0e1a;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:10px">Reset password</a>
     </p>
     <p style="color:#8a93ad;font-size:13px">This link expires in 1 hour.</p>`);
    const text = `Reset your Octolio password by opening: ${link}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`;
    await send({ to, subject: 'Reset your Octolio password', html, text });
}
function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
