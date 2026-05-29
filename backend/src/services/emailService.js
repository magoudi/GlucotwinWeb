const nodemailer = require('nodemailer');

const emailFrom = process.env.EMAIL_FROM || 'GlucoTwin <noreply@glucotwin.com>';
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

let transporter = null;
let isEthereal = false;

/**
 * Initialize the Nodemailer transporter.
 */
async function getTransporter() {
  if (transporter) return transporter;

  // If real SMTP credentials are provided (like Gmail)
  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort == 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    console.log(`[EmailService] Configured real SMTP server: ${smtpHost}`);
    return transporter;
  }

  // Fallback to Ethereal Email (a real SMTP testing service that catches emails)
  console.log('[EmailService] No SMTP credentials found in .env. Creating Ethereal test account...');
  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  
  isEthereal = true;
  console.log('[EmailService] Created Ethereal test account. Emails will be caught and a URL will be generated.');
  return transporter;
}

/**
 * Send an email using the configured provider.
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @returns {Promise<boolean>} Success status
 */
async function sendEmail({ to, subject, html }) {
  try {
    const tp = await getTransporter();
    
    const info = await tp.sendMail({
      from: emailFrom,
      to,
      subject,
      html,
    });

    console.log(`[EmailService] Sent email to ${to} (Message ID: ${info.messageId})`);
    
    // If using Ethereal, print the link so the developer can see the email!
    if (isEthereal) {
      console.log('\n========================================================');
      console.log('📧 TEST EMAIL SENT! View it in your browser here:');
      console.log(`🔗 ${nodemailer.getTestMessageUrl(info)}`);
      console.log('========================================================\n');
    }

    return true;
  } catch (err) {
    console.error('[EmailService] Exception sending email:', err);
    return false;
  }
}

/**
 * Send a password reset email
 * @param {Object} options
 * @param {string} options.to 
 * @param {string} options.code 
 * @param {number} options.expiresInMinutes 
 */
async function sendPasswordResetCode({ to, code, expiresInMinutes }) {
  const html = `
    <h2>GlucoTwin Password Reset</h2>
    <p>You recently requested to reset your password for your GlucoTwin account.</p>
    <p>Please enter the following 6-digit verification code to reset your password:</p>
    <div style="padding: 16px; background-color: #f3f4f6; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; margin: 20px 0;">
      ${code}
    </div>
    <p>If you did not request a password reset, please ignore this email or reply to let us know. This verification code is only valid for the next ${expiresInMinutes} minutes.</p>
    <br>
    <p>Thanks,</p>
    <p>The GlucoTwin Team</p>
  `;

  return sendEmail({
    to,
    subject: 'Reset your password for GlucoTwin',
    html,
  });
}

module.exports = {
  sendEmail,
  sendPasswordResetCode,
};
