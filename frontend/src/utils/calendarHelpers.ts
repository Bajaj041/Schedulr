import { Booking } from '../types';
import { format, parseISO } from 'date-fns';

export function generateGoogleCalendarUrl(booking: Booking): string {
  const start = parseISO(booking.startTime);
  const end = parseISO(booking.endTime);

  const formatGCalDate = (d: Date) => format(d, "yyyyMMdd'T'HHmmss");

  const dates = `${formatGCalDate(start)}/${formatGCalDate(end)}`;
  const title = encodeURIComponent(booking.eventTitle);
  const details = encodeURIComponent(
    `Host: ${booking.hostName} (${booking.hostEmail})\n` +
    `Attendee: ${booking.attendeeName} (${booking.attendeeEmail})\n` +
    `Meeting Video Link: ${booking.meetingUrl}\n\n` +
    (booking.attendeeNotes ? `Notes: ${booking.attendeeNotes}\n\n` : '') +
    `Powered by Schedulr`
  );
  const location = encodeURIComponent(booking.meetingUrl);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

export function downloadIcsFile(booking: Booking): void {
  const start = parseISO(booking.startTime);
  const end = parseISO(booking.endTime);

  const formatIcsDate = (d: Date) => format(d, "yyyyMMdd'T'HHmmss'Z'");

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Schedulr//Schedulr Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${booking.id}@schedulr.io`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${booking.eventTitle}`,
    `DESCRIPTION:${booking.eventTitle} with ${booking.hostName}\\nVideo Call: ${booking.meetingUrl}\\nAttendee: ${booking.attendeeName}`,
    `LOCATION:${booking.meetingUrl}`,
    `ORGANIZER;CN=${booking.hostName}:mailto:${booking.hostEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${booking.attendeeName}:mailto:${booking.attendeeEmail}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${booking.eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
