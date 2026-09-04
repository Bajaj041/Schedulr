import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Schedulr <notifications@schedulr.app>';

const transporter = SMTP_HOST && SMTP_USER
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

function generateICSContent(params: {
  id: string;
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  organizerName: string;
  organizerEmail: string;
  attendeeName: string;
  attendeeEmail: string;
}): string {
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Schedulr//Scheduling App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${params.id}@schedulr.app`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(params.startTime)}`,
    `DTEND:${formatICSDate(params.endTime)}`,
    `SUMMARY:${params.summary}`,
    `DESCRIPTION:${params.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${params.location}`,
    `ORGANIZER;CN=${params.organizerName}:mailto:${params.organizerEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${params.attendeeName}:mailto:${params.attendeeEmail}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

export const emailService = {
  sendBookingConfirmation: async (params: {
    bookingId: string;
    eventTitle: string;
    startTime: Date;
    endTime: Date;
    hostName: string;
    hostEmail: string;
    attendeeName: string;
    attendeeEmail: string;
    meetingUrl: string;
  }) => {
    const formattedDate = params.startTime.toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const icsString = generateICSContent({
      id: params.bookingId,
      summary: `${params.eventTitle} with ${params.hostName}`,
      description: `Meeting scheduled via Schedulr.\nJoin Link: ${params.meetingUrl}`,
      startTime: params.startTime,
      endTime: params.endTime,
      location: params.meetingUrl,
      organizerName: params.hostName,
      organizerEmail: params.hostEmail,
      attendeeName: params.attendeeName,
      attendeeEmail: params.attendeeEmail
    });

    if (transporter) {
      try {
        await transporter.sendMail({
          from: EMAIL_FROM,
          to: `${params.attendeeEmail}, ${params.hostEmail}`,
          subject: `Confirmed: ${params.eventTitle} - ${formattedDate}`,
          text: `Hi ${params.attendeeName},\n\nYour session "${params.eventTitle}" with ${params.hostName} is confirmed for ${formattedDate}.\n\nJoin Meeting: ${params.meetingUrl}\n\nThank you,\nSchedulr Team`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
              <h2 style="color: #f59e0b; margin-top: 0;">Schedulr Booking Confirmed</h2>
              <p>Hi <strong>${params.attendeeName}</strong>,</p>
              <p>Your session with <strong>${params.hostName}</strong> has been confirmed.</p>
              <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin: 20px 0;">
                <p style="margin: 4px 0;"><strong>Event:</strong> ${params.eventTitle}</p>
                <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
                <p style="margin: 4px 0;"><strong>Video Link:</strong> <a href="${params.meetingUrl}" style="color: #f59e0b;">${params.meetingUrl}</a></p>
              </div>
              <p style="font-size: 12px; color: #64748b;">A calendar invite has been attached to this email.</p>
            </div>
          `,
          attachments: [
            {
              filename: 'invite.ics',
              content: icsString,
              contentType: 'text/calendar; charset=utf-8; method=REQUEST'
            }
          ]
        });
        console.log(`📧 Confirmation email sent to ${params.attendeeEmail} & ${params.hostEmail}`);
      } catch (err) {
        console.warn('⚠️ Could not send SMTP email:', err);
      }
    } else {
      console.log(`ℹ️ [Email Dispatch (Simulated)]: Booking confirmation sent to ${params.attendeeEmail}`);
    }
  },

  sendCancellationNotice: async (params: {
    eventTitle: string;
    hostName: string;
    hostEmail: string;
    attendeeName: string;
    attendeeEmail: string;
    reason?: string;
  }) => {
    console.log(`ℹ️ [Email Dispatch (Simulated)]: Cancellation notification sent for "${params.eventTitle}" to ${params.attendeeEmail}`);
  }
};
