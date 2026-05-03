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

  // Email verification link
  sendVerificationEmail: async (user, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Verify Your Email 🐾</h1>
        <p>Hi ${user.name},</p>
        <p>Please verify your email address by clicking the button below. This link expires in 24 hours.</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Verify Email Address
        </a>
        <p style="color: #666; font-size: 14px;">If you did not create an account, please ignore this email.</p>
        <p style="color: #999; font-size: 12px;">Link: ${verificationUrl}</p>
      </div>
    `;
    return emailService.sendEmail({
      to: user.email,
      subject: 'Verify your PET4U email address',
      html,
      text: `Verify your email: ${verificationUrl}`,
    });
  },

  // Password reset email
  sendPasswordResetEmail: async (user, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Reset Your Password 🔒</h1>
        <p>Hi ${user.name},</p>
        <p>We received a request to reset your password. Click below to set a new password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">If you did not request a password reset, you can safely ignore this email.</p>
        <p style="color: #999; font-size: 12px;">Link: ${resetUrl}</p>
      </div>
    `;
    return emailService.sendEmail({
      to: user.email,
      subject: 'Reset your PET4U password',
      html,
      text: `Reset your password: ${resetUrl}`,
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

  // Appointment request notification to shelter
  sendAppointmentRequestEmail: async (shelter, adopter, pet, appointment) => {
    const dateStr = new Date(appointment.scheduledDate).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Meet-and-Greet Request 📅</h1>
        <p>Hi ${shelter.name},</p>
        <p><strong>${adopter.name}</strong> has requested an appointment to meet <strong>${pet.name}</strong>.</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Date:</strong> ${dateStr}</p>
          <p><strong>Time:</strong> ${appointment.startTime} – ${appointment.endTime}</p>
          <p><strong>Adopter:</strong> ${adopter.name} (${adopter.email})</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/appointments" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View Appointment
        </a>
      </div>
    `;
    return emailService.sendEmail({
      to: shelter.email,
      subject: `New Meet-and-Greet Request for ${pet.name}`,
      html,
      text: `${adopter.name} wants to meet ${pet.name} on ${dateStr}.`
    });
  },

  // Appointment confirmed notification to adopter
  sendAppointmentConfirmedEmail: async (adopter, pet, shelter, appointment) => {
    const dateStr = new Date(appointment.scheduledDate).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Appointment Confirmed! ✅</h1>
        <p>Hi ${adopter.name},</p>
        <p>Your meet-and-greet with <strong>${pet.name}</strong> at ${shelter.name} has been confirmed.</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Date:</strong> ${dateStr}</p>
          <p><strong>Time:</strong> ${appointment.startTime} – ${appointment.endTime}</p>
          ${appointment.location ? `<p><strong>Location:</strong> ${appointment.location}</p>` : ''}
          ${appointment.isVirtual && appointment.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${appointment.meetingLink}">${appointment.meetingLink}</a></p>` : ''}
        </div>
        <a href="${process.env.FRONTEND_URL}/appointments" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View Appointment
        </a>
      </div>
    `;
    return emailService.sendEmail({
      to: adopter.email,
      subject: `Appointment Confirmed – Meet ${pet.name}!`,
      html,
      text: `Your appointment to meet ${pet.name} on ${dateStr} is confirmed.`
    });
  }
};

module.exports = emailService;
