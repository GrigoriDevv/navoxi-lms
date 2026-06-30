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

export function isDirectVideoUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:video/")) return true;
  try {
    const url = new URL(trimmed);
    return VIDEO_EXT.test(url.pathname);
  } catch {
    return VIDEO_EXT.test(trimmed);
  }
}

export function resolveLessonVideoInput(
  input: string,
  uploadedFileUrl?: string | null
): { youtubeVideoId?: string; videoUrl?: string } | null {
  if (uploadedFileUrl) return { videoUrl: uploadedFileUrl };

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
  if (media.videoUrl.startsWith("data:video/")) return "";
  return media.videoUrl;
}

export function lessonUsesUploadedFile(lesson: CourseLesson): boolean {
  return Boolean(lesson.videoUrl?.startsWith("data:video/"));
}
