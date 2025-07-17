import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  const uniqueClasses = [...new Set(clsx(inputs).split(' '))].join(' ');
  return twMerge(uniqueClasses);
}
