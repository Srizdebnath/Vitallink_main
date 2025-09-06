
import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    if (!transporter) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
    return transporter;
  } else {
    if (!transporter) {
      const testAccount = await nodemailer.createTestAccount();
      console.log('--- ETHEREAL CREDENTIALS ---');
      console.log('User:', testAccount.user);
      console.log('Pass:', testAccount.pass);
      console.log('You can log in at https://ethereal.email/login');
      console.log('----------------------------');
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }
    return transporter;
  }
};

export async function sendVerificationEmail(to: string, otp: string): Promise<boolean> {
  try {
    const transporter = await getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"VitalLink Platform" <noreply@vitallink.com>',
      to: to,
      subject: 'Your VitalLink Verification Code',
      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 400px; margin: auto;">
          <h2 style="color: #31736e;">Welcome to VitalLink!</h2>
          <p>Your One-Time Password (OTP) to verify your email is:</p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 5px; background: #f0f9f8; padding: 15px; border-radius: 5px; color: #3b8e87;">${otp}</p>
          <p style="color: #666;">This code will expire in 10 minutes.</p>
          <p style="font-size: 12px; color: #999;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    transporter = null;
    return false;
  }
}