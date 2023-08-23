const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Asim khan  <asimabas34@.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  html: `
    <h1>Welcome to Password reset </h1>
    <p>Dear recipient,</p>
    <p>We are excited to have you join our newsletter. Here's some important information for you:</p>
    <h2> ${options.message}</h2>
    <p>If you have any questions, feel free to reply to this email. We look forward to seeing you there!</p>
    <p>Best regards,<br>Your Team</p>
  `,
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
