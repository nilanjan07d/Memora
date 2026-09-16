const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendPasswordResetEmail = async (email, resetUrl) => {
  await transporter.sendMail({
    from: `"Memora" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your Memora password",

    text: `You requested a password reset for your Memora account.

Open this link to reset your password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request this password reset, you can safely ignore this email.`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 30px;
        color: #333;
      ">
        <h1 style="color: #cb5a32;">Memora</h1>

        <h2>Reset your password</h2>

        <p>
          We received a request to reset the password for your Memora account.
        </p>

        <p>
          Click the button below to create a new password.
        </p>

        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            padding: 14px 24px;
            background-color: #cb5a32;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
          "
        >
          Reset Password
        </a>

        <p style="margin-top: 25px;">
          This link will expire in <strong>15 minutes</strong>.
        </p>

        <p style="color: #777; font-size: 13px;">
          If you did not request this password reset, you can safely ignore
          this email.
        </p>
      </div>
    `,
  });
};

module.exports = {
  sendPasswordResetEmail,
};