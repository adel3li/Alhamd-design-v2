/**
 * Converts Western digits 0-9 into Arabic-Indic digits ٠-٩
 */
export function toArabicNumerals(num: number | string): string {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (d) => digits[Number(d)]);
}

/**
 * Formats time from HH:mm to Arabic representation, e.g. "9:00 م" or "٧:٣٠ ص"
 */
export function formatArabicTime(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return toArabicNumerals(timeStr);

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const isPM = hours >= 12;
  
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  const period = isPM ? 'م' : 'ص';
  return `${toArabicNumerals(hours)}:${toArabicNumerals(minutes)} ${period}`;
}

/**
 * Formats a Date object to Arabic time string e.g. "٩:١٤ م"
 */
export function formatTimestampArabicTime(timestamp: number | Date): string {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const isPM = hours >= 12;

  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  const period = isPM ? 'م' : 'ص';
  return `${toArabicNumerals(hours)}:${toArabicNumerals(minutes)} ${period}`;
}
