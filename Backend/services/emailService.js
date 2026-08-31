const nodemailer = require("nodemailer");

const requireEmailConfig = () => {
  const config = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
  };

  if (!config.host || !config.user || !config.pass) {
    throw new Error("Email SMTP configuration is missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and optionally EMAIL_FROM.");
  }

  return config;
};

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const config = requireEmailConfig();

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  const mailOptions = {
    from: config.from,
    to,
    subject: "Password Reset Request - VoteManage",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1d4ed8;">Password Reset Request</h2>
        <p>Hello ${name || "there"},</p>
        <p>We received a request to reset your password for your VoteManage account.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 18px; text-decoration: none; border-radius: 8px;">
            Reset Your Password
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p style="word-break: break-word; color: #374151;">${resetUrl}</p>
        <p>This link is valid for a limited time and can be used only once.</p>
        <p>If you did not request this password reset, you can safely ignore this email.</p>
        <p>Thank you,<br />VoteManage Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("SMTP sendMail failed:", error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail,
};
