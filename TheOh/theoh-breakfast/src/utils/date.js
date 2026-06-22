/**
 * Calculates the earliest available subscription start date.
 * Cut-off time is 10:00 PM (22:00) daily.
 * - Before 10:00 PM: Earliest delivery is tomorrow (today + 1).
 * - After 10:00 PM: Earliest delivery is day after tomorrow (today + 2) to allow preparation time.
 * 
 * @returns {string} Date string in YYYY-MM-DD format.
 */
export function getMinStartDate() {
  const now = new Date();
  const cutoffHour = 22; // 10 PM
  
  const minDate = new Date(now);
  if (now.getHours() >= cutoffHour) {
    // Past cutoff, push to day after tomorrow
    minDate.setDate(now.getDate() + 2);
  } else {
    // Before cutoff, can deliver tomorrow
    minDate.setDate(now.getDate() + 1);
  }
  
  // Format as YYYY-MM-DD
  const year = minDate.getFullYear();
  const month = String(minDate.getMonth() + 1).padStart(2, '0');
  const day = String(minDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Formats a YYYY-MM-DD date string into a user-friendly format (e.g., "24 Jun 2026").
 * 
 * @param {string} dateStr 
 * @returns {string}
 */
export function formatDateFriendly(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
