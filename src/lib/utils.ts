import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safe string conversion utility - handles Date objects and other non-string values
export function safeStringConversion(value: any): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) {
    return !isNaN(value.getTime()) ? value.toISOString().split('T')[0] : '';
  }
  return String(value);
}
