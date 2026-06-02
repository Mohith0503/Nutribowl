/**
 * Formats a number as Indian Rupees (INR)
 * @param {number} value - The price value to format
 * @returns {string} - Formatted currency string
 */
export function formatINR(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}
