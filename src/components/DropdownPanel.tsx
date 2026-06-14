"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type DropdownPanelChildren =
  | ReactNode
  | ((api: { close: () => void }) => ReactNode);

export function DropdownPanel({
  trigger,
  children,
  align = "right",
  width = "w-80",
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: DropdownPanelChildren;
  align?: "left" | "right";
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div
          className={`absolute top-full mt-2 ${width} bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden ${
            align === "right" ? "right-0" : "left-0"
          }`}
          role="menu"
        >
          {typeof children === "function" ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}
