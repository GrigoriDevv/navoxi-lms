const paths: Record<string, string> = {
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z",
  users: "M16 11a4 4 0 10-8 0 4 4 0 008 0zM2 21a8 8 0 0116 0",
  book: "M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2zM18 3v18",
  group: "M9 11a3 3 0 100-6 3 3 0 000 6zM17 11a3 3 0 100-6M2 20a6 6 0 0114 0M16 14a6 6 0 016 6",
  route: "M6 19a3 3 0 100-6 3 3 0 000 6zM18 11a3 3 0 100-6 3 3 0 000 6zM6 13V9a4 4 0 014-4h2M12 19h2a4 4 0 004-4v-2",
  calendar: "M3 9h18M7 3v4M17 3v4M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z",
  folder: "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  cog: "M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1l2-1.5-2-3.5-2.3 1a7 7 0 00-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 00-1.7 1l-2.3-1-2 3.5 2 1.5a7 7 0 000 2l-2 1.5 2 3.5 2.3-1a7 7 0 001.7 1l.3 2.5h4l.3-2.5a7 7 0 001.7-1l2.3 1 2-3.5-2-1.5c.07-.32.1-.66.1-1z",
  plug: "M9 2v6M15 2v6M7 8h10v4a5 5 0 01-10 0zM12 17v5",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  logout: "M16 17l5-5-5-5M21 12H9M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4",
  plus: "M12 5v14M5 12h14",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
  bell: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0",
  check: "M20 6L9 17l-5-5",
  trend: "M3 17l6-6 4 4 8-8M21 7h-5M21 7v5",
  chevron: "M6 9l6 6 6-6",
  user: "M20 21a8 8 0 10-16 0M12 11a4 4 0 100-8 4 4 0 000 8",
  help: "M12 18h.01M8.2 8.2a4 4 0 015.6 5.6c-.9.9-1.4 1.4-1.4 2.8v.4",
  refresh: "M4 4v5h5M20 20v-5h-5M5 19a9 9 0 0014-7M19 5a9 9 0 00-14 7",
};

export function Icon({
  name,
  className = "w-5 h-5",
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={paths[name] ?? paths.grid} />
    </svg>
  );
}
