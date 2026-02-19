
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

export async function sendResetEmail(email: string, resetUrl: string) {
  try {
    const info = await transporter.sendMail({
      from: `"FixSure Support" <${process.env.APP_EMAIL}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #FF6442;">Password Reset Request</h2>
          <p>You requested a password reset for your FixSure account.</p>
          <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #FF6442; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999;">Best regards,<br>The FixSure Team</p>
        </div>
      `,
    });
    console.log("Message sent: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendOtpEmail(email: string, otp: string) {
  try {
    const info = await transporter.sendMail({
      from: `"FixSure Support" <${process.env.APP_EMAIL}>`,
      to: email,
      subject: "Your OTP for Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #FF6442; text-align: center;">Password Reset OTP</h2>
          <p style="text-align: center;">Use the OTP below to reset your password. This OTP is valid for 5 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="background-color: #f0f0f0; color: #333; padding: 15px 30px; font-size: 32px; letter-spacing: 5px; font-weight: bold; border-radius: 8px; border: 1px solid #ddd;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center;">Do not share this OTP with anyone.</p>
          <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999; text-align: center;">Best regards,<br>The FixSure Team</p>
        </div>
      `,
    });
    console.log("OTP sent: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, error: "Failed to send OTP" };
  }
}
