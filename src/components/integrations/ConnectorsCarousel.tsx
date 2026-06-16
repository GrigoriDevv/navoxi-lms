"use client";

import { useRef, useState, useCallback } from "react";
import type { IntegrationConnector } from "@/lib/types";
import { IntegrationBrandLogo } from "@/components/integrations/IntegrationBrandLogo";
import { Badge } from "@/components/ui";
import { Icon } from "@/components/Icon";

interface ConnectorsCarouselProps {
  connectors: IntegrationConnector[];
}

export function ConnectorsCarousel({ connectors }: ConnectorsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
    window.setTimeout(updateScrollState, 350);
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        aria-label="Anterior"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md grid place-items-center text-slate-600 hover:text-brand hover:border-brand disabled:opacity-0 disabled:pointer-events-none transition"
      >
        <Icon name="chevron" className="w-5 h-5 rotate-90" />
      </button>

      <button
        type="button"
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        aria-label="Próximo"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md grid place-items-center text-slate-600 hover:text-brand hover:border-brand disabled:opacity-0 disabled:pointer-events-none transition"
      >
        <Icon name="chevron" className="w-5 h-5 -rotate-90" />
      </button>

      <div
        ref={trackRef}
        onScroll={updateScrollState}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 py-1 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {connectors.map((connector) => (
          <article
            key={connector.id}
            className={`snap-start shrink-0 w-[min(100%,280px)] p-4 rounded-xl border transition cursor-pointer ${
              connector.featured
                ? "border-brand/40 bg-gradient-to-br from-blue-50 to-sky-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-brand/50 hover:shadow-sm"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`h-11 w-11 rounded-lg grid place-items-center shrink-0 overflow-hidden ${
                  connector.featured ? "ring-2 ring-brand/30" : ""
                }`}
              >
                <IntegrationBrandLogo brand={connector.brand} className="w-11 h-11" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-slate-800">{connector.name}</h4>
                  {connector.featured && <Badge color="green">Conectado</Badge>}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{connector.category}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-3 line-clamp-2">{connector.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
