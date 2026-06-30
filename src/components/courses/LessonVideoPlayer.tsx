"use client";

import type { CourseLesson } from "@/lib/types";
import { getLessonMedia } from "@/lib/lesson-media";
import { YoutubePlayer } from "./YoutubePlayer";
import { NativeVideoPlayer } from "./NativeVideoPlayer";

interface LessonVideoPlayerProps {
  lesson: CourseLesson;
  onComplete?: () => void;
  className?: string;
}

export function LessonVideoPlayer({ lesson, onComplete, className }: LessonVideoPlayerProps) {
  const media = getLessonMedia(lesson);

  if (!media) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-400 aspect-video flex items-center justify-center">
        Vídeo indisponível para esta aula.
      </div>
    );
  }

  if (media.kind === "video") {
    return (
      <NativeVideoPlayer
        key={lesson.id}
        src={media.videoUrl}
        onComplete={onComplete}
        className={className}
      />
    );
  }

  return (
    <YoutubePlayer
      key={lesson.id}
      videoId={media.youtubeVideoId}
      onComplete={onComplete}
      className={className}
    />
  );
}
