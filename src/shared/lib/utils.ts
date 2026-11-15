import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Joins class names; when Tailwind utilities conflict, the later one wins. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
