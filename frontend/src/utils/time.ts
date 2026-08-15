export const NEPAL_TIME_ZONE = 'Asia/Kathmandu';

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

function parseDate(value: string | Date): Date {
  if (value instanceof Date) return value;

  // A DATE column has no time or offset. Anchor it at midnight in Nepal so
  // browser/server timezones cannot move it to the previous calendar date.
  return new Date(dateOnlyPattern.test(value) ? `${value}T00:00:00+05:45` : value);
}

export function formatNepalDate(value: string | Date): string {
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('en-NP', {
    timeZone: NEPAL_TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatNepalDateTime(value: string | Date): string {
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('en-NP', {
    timeZone: NEPAL_TIME_ZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
