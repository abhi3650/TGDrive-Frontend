import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FileItem } from "./types";

export interface SubtitleTrack {
  src: string;
  srclang: string;
  label: string;
  default?: boolean;
}

// Helper for conditional classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format bytes to human readable string
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Check if file is video
export function isVideoFile(filename: string) {
  return /\.(mp4|mkv|webm|mov|avi)$/i.test(filename);
}

export function isSubtitleFile(filename: string) {
  return /\.(srt|vtt|ass|ssa)$/i.test(filename);
}

const knownLanguageMap: Record<string, string> = {
  en: "English",
  eng: "English",
  es: "Spanish",
  spa: "Spanish",
  fr: "French",
  deu: "German",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  jp: "Japanese",
  ko: "Korean",
  ar: "Arabic",
  hi: "Hindi",
  tr: "Turkish",
  zh: "Chinese",
};

export function detectSubtitlesForVideo(video: FileItem, allItems: FileItem[], getFileDownloadUrl: (path: string, id: string) => string): SubtitleTrack[] {
  const videoBaseName = video.name.replace(/\.[^.]+$/, "").toLowerCase();

  const subtitleItems = allItems.filter((item) => {
    if (item.type !== "file" || !isSubtitleFile(item.name)) return false;
    const subtitleBaseName = item.name.replace(/\.[^.]+$/, "").toLowerCase();
    return (
      subtitleBaseName === videoBaseName ||
      subtitleBaseName.startsWith(`${videoBaseName}.`) ||
      subtitleBaseName.startsWith(`${videoBaseName}_`) ||
      subtitleBaseName.startsWith(`${videoBaseName}-`) ||
      videoBaseName.startsWith(`${subtitleBaseName}.`)
    );
  });

  return subtitleItems.map((sub, index) => {
    const nameWithoutExt = sub.name.replace(/\.[^.]+$/, "");
    const languageHint = nameWithoutExt.split(/[._-]/).pop()?.toLowerCase() || "en";
    const srclang = /^[a-z]{2,3}$/.test(languageHint) ? languageHint.slice(0, 2) : "en";
    const readableLanguage = knownLanguageMap[languageHint] || knownLanguageMap[srclang] || `Subtitle ${index + 1}`;

    return {
      src: getFileDownloadUrl(sub.path, sub.id),
      srclang,
      label: readableLanguage,
      default: index === 0,
    };
  });
}
