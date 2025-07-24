/**
 * Formats a phone number to XXX-XXX-XXXX format
 * @param value - The phone number input (can contain numbers, spaces, dashes, etc.)
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-numeric characters
  const cleaned = value.replace(/\D/g, '');
  
  // Limit to 10 digits for US phone numbers
  const truncated = cleaned.slice(0, 10);
  
  // Apply formatting based on length
  if (truncated.length >= 6) {
    return `${truncated.slice(0, 3)}-${truncated.slice(3, 6)}-${truncated.slice(6)}`;
  } else if (truncated.length >= 3) {
    return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
  } else {
    return truncated;
  }
}

/**
 * Strips formatting from phone number to get just digits
 * @param formattedPhone - Phone number with formatting (XXX-XXX-XXXX)
 * @returns Just the digits (XXXXXXXXXX)
 */
export function stripPhoneFormatting(formattedPhone: string): string {
  return formattedPhone.replace(/\D/g, '');
}

/**
 * Validates if a phone number is complete (10 digits)
 * @param phone - Phone number string (formatted or unformatted)
 * @returns boolean indicating if phone number is valid
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = stripPhoneFormatting(phone);
  return cleaned.length === 10;
}