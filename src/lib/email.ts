import nodemailer from 'nodemailer'

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email not configured, would send:', { to, subject })
      return true // Return true in development when email is not configured
    }

    await transporter.sendMail({
      from: `"Flipbook DRM" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html,
    })

    console.log('Email sent successfully to:', to)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

export function generateVerificationEmailHTML(verificationUrl: string, userName?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - Flipbook DRM</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        .title {
          color: #1f2937;
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }
        .subtitle {
          color: #6b7280;
          font-size: 16px;
          margin: 10px 0 0 0;
        }
        .content {
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          text-align: center;
          margin: 20px 0;
        }
        .button:hover {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
        .security-note {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          font-size: 14px;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📄</div>
          <h1 class="title">Verify Your Email Address</h1>
          <p class="subtitle">Welcome to Flipbook DRM - Secure Document Platform</p>
        </div>
        
        <div class="content">
          <p>Hi${userName ? ` ${userName}` : ''},</p>
          
          <p>Thank you for signing up for Flipbook DRM! To complete your registration and start securing your documents, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #3b82f6; font-family: monospace; background: #f3f4f6; padding: 10px; border-radius: 4px;">
            ${verificationUrl}
          </p>
          
          <div class="security-note">
            <strong>Security Note:</strong> This verification link will expire in 24 hours for your security. If you didn't create an account with Flipbook DRM, please ignore this email.
          </div>
          
          <p>Once verified, you'll be able to:</p>
          <ul>
            <li>Upload and secure your PDF documents</li>
            <li>Create protected sharing links</li>
            <li>Track document access and analytics</li>
            <li>Manage your subscription and billing</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>This email was sent by Flipbook DRM. If you have any questions, please contact our support team.</p>
          <p>© ${new Date().getFullYear()} Flipbook DRM. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateWelcomeEmailHTML(userName?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Flipbook DRM</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 12px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        .title {
          color: #1f2937;
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          text-align: center;
          margin: 20px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">✅</div>
          <h1 class="title">Welcome to Flipbook DRM!</h1>
        </div>
        
        <div class="content">
          <p>Hi${userName ? ` ${userName}` : ''},</p>
          
          <p>🎉 Congratulations! Your email has been verified and your Flipbook DRM account is now active.</p>
          
          <p>You can now start securing your documents with our advanced DRM protection features:</p>
          
          <ul>
            <li><strong>Secure Document Upload:</strong> Upload PDFs with military-grade encryption</li>
            <li><strong>Advanced Watermarking:</strong> Protect your content with custom watermarks</li>
            <li><strong>Controlled Sharing:</strong> Create time-limited, secure sharing links</li>
            <li><strong>Access Analytics:</strong> Track who views your documents and when</li>
            <li><strong>IP & Device Restrictions:</strong> Control where your documents can be accessed</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" class="button">Get Started</a>
          </div>
          
          <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Flipbook DRM for your document security needs!</p>
          <p>© ${new Date().getFullYear()} Flipbook DRM. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}