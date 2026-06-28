"use client";

function MicrosoftLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 21 21" aria-hidden>
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

interface MicrosoftSignInButtonProps {
  enabled: boolean;
  className?: string;
}

export function MicrosoftSignInButton({
  enabled,
  className = "",
}: MicrosoftSignInButtonProps) {
  if (!enabled) {
    return (
      <div
        className={`w-full py-2.5 px-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-sm text-center ${className}`}
      >
        <span className="inline-flex items-center justify-center gap-2">
          <MicrosoftLogo />
          Entrar com Microsoft (não configurado)
        </span>
      </div>
    );
  }

  return (
    <a
      href="/api/auth/microsoft"
      className={`w-full py-2.5 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm transition flex items-center justify-center gap-2.5 shadow-sm ${className}`}
    >
      <MicrosoftLogo />
      Entrar com Microsoft
    </a>
  );
}
