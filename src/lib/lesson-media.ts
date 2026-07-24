import type { CourseLesson } from "./types";
import { parseYoutubeVideoId } from "./youtube-url";

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv|mkv)(\?.*)?$/i;

export type LessonMedia =
  | { kind: "youtube"; youtubeVideoId: string }
  | { kind: "video"; videoUrl: string };

export function getLessonMedia(lesson: CourseLesson): LessonMedia | null {
  if (lesson.videoUrl) return { kind: "video", videoUrl: lesson.videoUrl };
  if (lesson.youtubeVideoId) return { kind: "youtube", youtubeVideoId: lesson.youtubeVideoId };
  return null;
}

/** Persistable direct video URL (http/https only — never data:/blob:). */
export function isDirectVideoUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return VIDEO_EXT.test(url.pathname) || /video/i.test(url.pathname);
  } catch {
    return false;
  }
}

export function resolveLessonVideoInput(
  input: string,
  uploadedHttpUrl?: string | null
): { youtubeVideoId?: string; videoUrl?: string } | null {
  if (uploadedHttpUrl) {
    if (
      uploadedHttpUrl.startsWith("http://") ||
      uploadedHttpUrl.startsWith("https://") ||
      uploadedHttpUrl.startsWith("blob:")
    ) {
      return { videoUrl: uploadedHttpUrl };
    }
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) return null;

  const youtubeId = parseYoutubeVideoId(trimmed);
  if (youtubeId) return { youtubeVideoId: youtubeId };

  if (isDirectVideoUrl(trimmed)) return { videoUrl: trimmed };

  return null;
}

export function formatLessonMediaLabel(lesson: CourseLesson): string {
  const media = getLessonMedia(lesson);
  if (!media) return "—";
  return media.kind === "youtube" ? "YouTube" : "Vídeo (MP4)";
}

export function getLessonVideoInputValue(lesson: CourseLesson): string {
  const media = getLessonMedia(lesson);
  if (!media) return "";
  if (media.kind === "youtube") return media.youtubeVideoId;
  return media.videoUrl;
}

export function lessonUsesUploadedFile(lesson: CourseLesson): boolean {
  const url = lesson.videoUrl;
  if (!url) return false;
  return url.includes("/lessons/") || /\.(mp4|webm|mov)(\?|$)/i.test(url);
}
