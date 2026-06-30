"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";

interface NativeVideoPlayerProps {
  src: string;
  onComplete?: () => void;
  className?: string;
}

const COMPLETION_THRESHOLD = 0.9;

export function NativeVideoPlayer({ src, onComplete, className }: NativeVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);

  const markComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    completedRef.current = false;
    setStarted(false);
    setEnded(false);
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (video.duration > 0 && video.currentTime / video.duration >= COMPLETION_THRESHOLD) {
        markComplete();
      }
    };

    const onEnded = () => {
      setEnded(true);
      markComplete();
    };

    const onPlay = () => {
      setStarted(true);
      setEnded(false);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    video.addEventListener("play", onPlay);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("play", onPlay);
    };
  }, [src, markComplete]);

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    void video.play();
    setStarted(true);
    setEnded(false);
  };

  const handleReplay = () => {
    const video = videoRef.current;
    if (!video) return;
    completedRef.current = false;
    video.currentTime = 0;
    void video.play();
    setEnded(false);
    setStarted(true);
  };

  return (
    <div
      className={`relative w-full max-w-full aspect-video bg-black overflow-hidden ${className ?? ""}`}
    >
      <video
        ref={videoRef}
        key={src}
        src={src}
        className="absolute inset-0 w-full h-full object-contain bg-black"
        controls={started}
        playsInline
        preload="metadata"
      />

      {!started && (
        <button
          type="button"
          onClick={handlePlay}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-slate-950/95 text-white transition hover:bg-slate-950"
          aria-label="Reproduzir aula"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand shadow-lg shadow-brand/30">
            <Icon name="play" className="w-7 h-7 ml-1" />
          </span>
          <span className="text-sm font-medium text-slate-300">Reproduzir aula</span>
        </button>
      )}

      {ended && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-slate-950/90 text-white pointer-events-none">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600/90">
            <Icon name="check" className="w-6 h-6" />
          </span>
          <p className="text-sm font-medium">Aula concluída</p>
          <button
            type="button"
            onClick={handleReplay}
            className="text-xs text-slate-400 hover:text-white underline pointer-events-auto"
          >
            Assistir novamente
          </button>
        </div>
      )}
    </div>
  );
}
