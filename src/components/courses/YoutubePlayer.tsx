"use client";

import { useCallback, useEffect, useRef, useId, useState } from "react";
import { loadYoutubeIframeApi, type YtPlayer } from "@/lib/youtube-player-api";
import { Icon } from "@/components/Icon";

interface YoutubePlayerProps {
  videoId: string;
  onComplete?: () => void;
  className?: string;
}

const COMPLETION_THRESHOLD = 0.9;
const POLL_MS = 2000;

function styleIframe(container: HTMLElement | null) {
  const iframe = container?.querySelector("iframe");
  if (!iframe) return;
  iframe.setAttribute("title", "Reprodutor de vídeo");
  iframe.removeAttribute("width");
  iframe.removeAttribute("height");
}

export function YoutubePlayer({ videoId, onComplete, className }: YoutubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YtPlayer | null>(null);
  const completedRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reactId = useId();
  const elementId = `yt-player-${reactId.replace(/:/g, "")}`;

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
    let cancelled = false;

    const startPolling = (player: YtPlayer) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        try {
          const duration = player.getDuration();
          const current = player.getCurrentTime();
          if (duration > 0 && current / duration >= COMPLETION_THRESHOLD) {
            markComplete();
            if (pollRef.current) clearInterval(pollRef.current);
          }
        } catch {
          // player not ready
        }
      }, POLL_MS);
    };

    loadYoutubeIframeApi().then(() => {
      if (cancelled || !containerRef.current || !window.YT) return;

      playerRef.current?.destroy();
      playerRef.current = new window.YT.Player(elementId, {
        videoId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          playsinline: 1,
          fs: 1,
          cc_load_policy: 0,
          disablekb: 0,
          color: "white",
          hl: "pt",
          origin: typeof window !== "undefined" ? window.location.origin : "",
        },
        events: {
          onReady: (event) => {
            const apply = () => styleIframe(containerRef.current);
            apply();
            requestAnimationFrame(apply);
            setTimeout(apply, 150);
            startPolling(event.target);
          },
          onStateChange: (event) => {
            const YT = window.YT!;
            if (event.data === YT.PlayerState.PLAYING) {
              setStarted(true);
              setEnded(false);
            }
            if (event.data === YT.PlayerState.ENDED) {
              setEnded(true);
              markComplete();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [videoId, elementId, markComplete]);

  const handlePlay = () => {
    playerRef.current?.playVideo();
    setStarted(true);
    setEnded(false);
  };

  const handleReplay = () => {
    completedRef.current = false;
    setEnded(false);
    setStarted(true);
    playerRef.current?.playVideo();
  };

  return (
    <div
      className={`yt-clean-player relative w-full max-w-full aspect-video bg-black overflow-hidden ${className ?? ""}`}
    >
      <div
        ref={containerRef}
        id={elementId}
        className="absolute inset-0 w-full h-full"
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
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-slate-950/90 text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600/90">
            <Icon name="check" className="w-6 h-6" />
          </span>
          <p className="text-sm font-medium">Aula concluída</p>
          <button
            type="button"
            onClick={handleReplay}
            className="text-xs text-slate-400 hover:text-white underline"
          >
            Assistir novamente
          </button>
        </div>
      )}
    </div>
  );
}
