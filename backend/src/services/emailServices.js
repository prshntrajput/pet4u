const nodemailer = require('nodemailer');
const { logger } = require('../config/logger');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const emailService = {
  // Send email
  sendEmail: async ({ to, subject, html, text }) => {
    try {
      const info = await transporter.sendMail({
        from: `"${process.env.APP_NAME || 'PET4U'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text,
      });

      logger.info('Email sent successfully', { to, messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Email send error:', { error: error.message, to });
      throw error;
    }
  },

  // Welcome email
  sendWelcomeEmail: async (user) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to PET4U! 🐾</h1>
        <p>Hi ${user.name},</p>
        <p>Thank you for joining PET4U, your trusted platform for pet adoption.</p>
        <p>As a <strong>${user.role}</strong>, you can now:</p>
        ${user.role === 'adopter' ? `
          <ul>
            <li>Browse available pets</li>
            <li>Save your favorite pets</li>
            <li>Send adoption requests</li>
            <li>Message shelters directly</li>
          </ul>
        ` : `
          <ul>
            <li>List pets for adoption</li>
            <li>Manage adoption requests</li>
            <li>Communicate with adopters</li>
            <li>Build your shelter profile</li>
          </ul>
        `}
        <p>Get started by exploring the platform!</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Go to Dashboard
        </a>
        <p style="margin-top: 24px; color: #666; font-size: 14px;">
          If you have any questions, feel free to contact us.
        </p>
      </div>
    `;

    const text = `Welcome to PET4U, ${user.name}! Thank you for joining us.`;

    return emailService.sendEmail({
      to: user.email,
      subject: 'Welcome to PET4U! 🐾',
      html,
      text,
    });
  },

  // Adoption request notification
  sendAdoptionRequestEmail: async (shelter, adopter, pet) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Adoption Request! 🐾</h1>
        <p>Hi ${shelter.name},</p>
        <p>You have received a new adoption request for <strong>${pet.name}</strong>.</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin-top: 0;">Adopter Details:</h3>
          <p><strong>Name:</strong> ${adopter.name}</p>
          <p><strong>Email:</strong> ${adopter.email}</p>
          <p><strong>Location:</strong> ${adopter.city}, ${adopter.state}</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/adoption-requests" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Request
        </a>
      </div>
    `;

    return emailService.sendEmail({
      to: shelter.email,
      subject: `New Adoption Request for ${pet.name}`,
      html,
      text: `You have a new adoption request for ${pet.name} from ${adopter.name}.`,
    });
  },

  // Request approved notification
  sendRequestApprovedEmail: async (adopter, pet, shelter, meetingDetails) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Adoption Request Approved! ✅</h1>
        <p>Hi ${adopter.name},</p>
        <p>Great news! Your adoption request for <strong>${pet.name}</strong> has been approved by ${shelter.name}.</p>
        ${meetingDetails ? `
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin-top: 0;">Meeting Details:</h3>
            <p><strong>Date & Time:</strong> ${new Date(meetingDetails.meetingDate).toLocaleString()}</p>
            <p><strong>Location:</strong> ${meetingDetails.meetingLocation}</p>
            ${meetingDetails.meetingNotes ? `<p><strong>Notes:</strong> ${meetingDetails.meetingNotes}</p>` : ''}
          </div>
        ` : ''}
        <p>Please reach out to the shelter if you have any questions.</p>
        <a href="${process.env.FRONTEND_URL}/my-requests" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Request Details
        </a>
      </div>
    `;

    return emailService.sendEmail({
      to: adopter.email,
      subject: `Adoption Request Approved - ${pet.name}`,
      html,
      text: `Your adoption request for ${pet.name} has been approved!`,
    });
  },
};

module.exports = emailService;
