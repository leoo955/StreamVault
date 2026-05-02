import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRuntime(minutes: number | null): string {
  if (!minutes) return "0m";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export function getYear(date: Date | string | null): string {
  if (!date) return "N/A";
  try {
    const d = new Date(date);
    const year = d.getFullYear();
    if (isNaN(year)) return "N/A";
    return year.toString();
  } catch (e) {
    return "N/A";
  }
}

export function getTmdbImage(path: string | null, size: string = "original"): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
