const { Resend } = require('resend');

const emailProvider = process.env.EMAIL_PROVIDER || 'mock';
const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'GlucoTwin <noreply@glucotwin.com>';

let resendClient = null;
if (emailProvider === 'resend' && resendApiKey) {
  resendClient = new Resend(resendApiKey);
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
  if (emailProvider === 'mock') {
    console.log('\n--- MOCK EMAIL ---');
    console.log(`To:      ${to}`);
    console.log(`From:    ${emailFrom}`);
    console.log(`Subject: ${subject}`);
    console.log('Body (HTML):');
    console.log(html);
    console.log('------------------\n');
    return true;
  }

  if (emailProvider === 'resend' && resendClient) {
    try {
      const { data, error } = await resendClient.emails.send({
        from: emailFrom,
        to,
        subject,
        html,
      });

      if (error) {
        console.error('[EmailService] Resend API Error:', error);
        return false;
      }

      console.log(`[EmailService] Sent email to ${to} (ID: ${data.id})`);
      return true;
    } catch (err) {
      console.error('[EmailService] Exception sending email:', err);
      return false;
    }
  }

  console.error(`[EmailService] Unknown or misconfigured email provider: ${emailProvider}`);
  return false;
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
