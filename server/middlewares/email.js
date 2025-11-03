import nodemailer from "nodemailer";
import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "tendingtoinfinitydevelopers@gmail.com",
    pass: process.env.EMAIL_PASSWORD,// Don't you dare delete this
  },
});

export const sendVerificationCode = async (email, verificationCode) => {
  try {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?code=${verificationCode}&email=${encodeURIComponent(email)}`;

    const info = await transporter.sendMail({
      from: '"Tending to Infinity" <tendingtoinfinitydevelopers@gmail.com>',
      to: email,
      subject: "🔐 Verify your email address",
      text: `Please verify your email by clicking the following link: ${verificationLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e2e2e2; padding: 20px; border-radius: 10px; background: #fafafa;">
          <h2 style="color: #333;">Welcome to <span style="color:#4f46e5">Tending to Infinity</span> 👋</h2>
          <p>Thanks for signing up! Click the button below to verify your email address:</p>
          <a href="${verificationLink}" style="display: inline-block; padding: 12px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-size: 16px; margin: 20px 0;">Verify Email</a>
          <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; color: #555;">${verificationLink}</p>
          <p style="font-size: 13px; color: #777;">— Team Tending to Infinity</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};



export const sendPasswordResetEmail = async (email, newPassword) => {
  try {
    const info = await transporter.sendMail({
      from: '"Tending to Infinity" <tendingtoinfinitydevelopers@gmail.com>',
      to: email,
      subject: "🔑 Reset your Tending to Infinity password",
      text: `Your password reset OTP is: ${newPassword}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e2e2e2; padding: 20px; border-radius: 10px; background: #fff0f1;">
          <h2 style="color: #b91c1c;">Password Reset Request</h2>
          <p>You’ve requested a password reset. Your password reset OTP is:</p>
          <div style="font-size: 20px; font-weight: bold; background: #fee2e2; color: #991b1b; padding: 10px 20px; border-radius: 8px; display: inline-block; margin: 20px 0;">
            ${newPassword}
          </div>
          <p>Enter the OTP in the website and enter your new password.</p>
          <p style="font-size: 13px; color: #777;">— Team Tending to Infinity</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

export const sendWelcomeEmail = async (email, name = "there") => {
  try {
    await transporter.sendMail({
      from: '"Tending to Infinity" <tendingtoinfinitydevelopers@gmail.com>',
      to: email,
      subject: `🎉 Welcome to Tending to Infinity, ${name}!`,
      text: `Welcome to Tending to Infinity, ${name}! We're excited to have you on board.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f0f9ff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h1 style="color: #0c4a6e;">Welcome to <span style="color: #2563eb;">Tending to Infinity</span>, ${name} 👋</h1>
          <p style="font-size: 16px; color: #334155;">
            We're thrilled to have you on board! Your account has been successfully created and verified. 
          </p>
          <p style="font-size: 16px; color: #334155;">
            You can now access exclusive content, features, and start exploring all that Tending to Infinity has to offer.
          </p>
          <p style="font-size: 14px; color: #64748b;">
            If you have any questions, feel free to reach out to us at support@tendingtoinfinityacademy.com.
          </p>
          <p style="font-size: 13px; color: #94a3b8;">— Team Tending to Infinity</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
};

export const sendOrderConfirmationEmail = async (user, razorpay_order_id, invoiceNumber, orderId, items, totalAmount) => {
  try {
    // const { orderId, items = [], totalAmount } = orderDetails;

    const itemList = items.map((item) => `<li>${item.title} - ₹${item.price}</li>`).join("");

    const orderDate = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f0f9ff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">

        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://notes-pdf.b-cdn.net/INFINITY%20Final%20Final%20Final.png" alt="Tending to Infinity" style="max-width: 150px; height: auto;"><br/>
          <h2 style="color: #0c4a6e; text-align: center;">Tending to Infinity | Tending to Infinity Academy</h2>
        </div>

        <!-- Invoice Header -->
        <h1 style="color: #0c4a6e; text-align: center; margin-bottom: 5px;">Invoice - ${invoiceNumber}</h1>
        <h2 style="color: #0c4a6e; text-align: center;">Order Confirmation - ${orderId}</h2><br/>
        <p style="font-size: 14px; color: #64748b; text-align: center;">Order Date: ${orderDate}</p>

        <!-- User Details -->
        <p style="font-size: 15px; color: #334155; margin-top: 10px; text-align: center;">
          <strong>Name:</strong> ${user.name}<br/>
          <strong>Role:</strong> ${user.role}
        </p>

        <!-- Order Details -->
        <p style="font-size: 16px; color: #334155; margin-top: 20px;">
          Thank you for your order! Here are the details:
        </p>
        <ul>
          ${itemList}
        </ul>

        <!-- Total -->
        <p style="font-size: 16px; color: #334155;">
          Total Amount: <strong>₹${(totalAmount / 100).toFixed(2)}</strong>
        </p>

        <!-- Footer -->
        <p style="font-size: 14px; color: #64748b;">
          If you have any questions, feel free to reach out to us at support@tendingtoinfinityacademy.com.
        </p>
        <p style="font-size: 13px; color: #94a3b8; text-align: center;">— Team Tending to Infinity</p>
      </div>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process',
      ],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    await transporter.sendMail({
      from: '"Tending to Infinity" <tendingtoinfinitydevelopers@gmail.com>',
      to: user.email,
      subject: `🛒 Invoice ${invoiceNumber} - Order ${orderId}`,
      text: `Thank you for your order! Your order ID is ${orderId}.`,
      html: htmlContent,
      attachments: [
        {
          filename: `Invoice-${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    throw new Error("Failed to send order confirmation email");
  }
};
