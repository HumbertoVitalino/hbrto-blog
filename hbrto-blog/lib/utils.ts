import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import slug from 'slug';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(title: string): string {
  return slug(title, { lower: true });
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
