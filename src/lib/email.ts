import nodemailer from 'nodemailer';

// SMTP Configuration from environment variables
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || '',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || '';

/**
 * Create nodemailer transporter
 */
function createTransporter() {
  return nodemailer.createTransport(SMTP_CONFIG);
}

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification email with 6-digit code
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
  userName?: string
): Promise<void> {
  const transporter = createTransporter();

  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject: 'Verify Your Email - Cashflow Tracker',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
              font-size: 28px;
            }
            .code-box {
              background: #f3f4f6;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .code {
              font-size: 36px;
              font-weight: bold;
              color: #2563eb;
              letter-spacing: 8px;
              margin: 10px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .note {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Cashflow Tracker</h1>
              <p style="color: #6b7280;">Email Verification</p>
            </div>

            <p>Hello${userName ? ` ${userName}` : ''},</p>

            <p>Thank you for securing your account with email and password authentication. To complete the verification process, please use the following 6-digit code:</p>

            <div class="code-box">
              <div>Your verification code is:</div>
              <div class="code">${code}</div>
            </div>

            <div class="note">
              <strong>Important:</strong> This code will expire in 15 minutes. If you didn't request this verification, please ignore this email.
            </div>

            <p>Once verified, you'll be able to log in using your email and password for enhanced security.</p>

            <div class="footer">
              <p>This is an automated email from Cashflow Tracker. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hello${userName ? ` ${userName}` : ''},

Thank you for securing your account with email and password authentication.

Your verification code is: ${code}

This code will expire in 15 minutes.

If you didn't request this verification, please ignore this email.

Once verified, you'll be able to log in using your email and password for enhanced security.

---
This is an automated email from Cashflow Tracker.
    `.trim(),
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email. Please check your email configuration.');
  }
}

/**
 * Test SMTP connection
 */
export async function testSMTPConnection(): Promise<boolean> {
  const transporter = createTransporter();
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('SMTP connection test failed:', error);
    return false;
  }
}
