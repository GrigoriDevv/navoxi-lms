import type { FC, ReactNode } from "react";
import type { IntegrationBrand } from "@/lib/integration-brands";

function LogoFrame({
  children,
  className = "w-10 h-10",
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label={label}>
      {children}
    </svg>
  );
}

function NotionLogo({ className }: { className?: string }) {
  return (
    <LogoFrame className={className} label="Notion">
      <rect width="40" height="40" rx="8" fill="#fff" stroke="#E5E7EB" />
      <path fill="#000" d="M10 12h14l6 3.5V28H10V12zm2 2v12h16V16.8L22 14H12zm3 3h8v1.5h-8V17zm0 3h8v1.5h-8V20zm0 3h5.5v1.5H12V23z" />
    </LogoFrame>
  );
}

function GoogleMeetLogo({ className }: { className?: string }) {
  return (
    <LogoFrame className={className} label="Google Meet">
      <rect width="40" height="40" rx="8" fill="#fff" />
      <path fill="#00832D" d="M12 14h10v12H12z" />
      <path fill="#0066DA" d="M22 14h6l4 4v4l-4 4h-6V14z" />
      <path fill="#E94235" d="M28 18l4-4v12l-4-4V18z" />
      <path fill="#2684FC" d="M22 22h6l-4 4h-6v-4z" />
      <path fill="#00AC47" d="M12 22h10v4H12v-4z" />
      <path fill="#FFBA00" d="M22 14l4 4h-4v-4z" />
    </LogoFrame>
  );
}

function PowerBiLogo({ className }: { className?: string }) {
  return (
    <LogoFrame className={className} label="Power BI">
      <rect width="40" height="40" rx="8" fill="#F2C811" />
      <rect x="11" y="22" width="5" height="10" rx="1" fill="#fff" />
      <rect x="17.5" y="16" width="5" height="16" rx="1" fill="#fff" />
      <rect x="24" y="10" width="5" height="22" rx="1" fill="#fff" />
    </LogoFrame>
  );
}

function GmailLogo({ className }: { className?: string }) {
  return (
    <LogoFrame className={className} label="Gmail">
      <rect width="40" height="40" rx="8" fill="#fff" />
      <path fill="#EA4335" d="M10 14v12l5-3.6V16.2L10 14z" />
      <path fill="#34A853" d="M30 14v12l-5-3.6V16.2L30 14z" />
      <path fill="#4285F4" d="M10 14l10 7.2L30 14H10z" />
      <path fill="#FBBC05" d="M15 20.4L10 26V14l5 6.4z" />
      <path fill="#C5221F" d="M25 20.4L30 26V14l-5 6.4z" />
    </LogoFrame>
  );
}

function PowerPointLogo({ className }: { className?: string }) {
  return (
    <LogoFrame className={className} label="Microsoft PowerPoint">
      <rect width="40" height="40" rx="8" fill="#D35230" />
      <path fill="#fff" d="M12 10h12l6 4.5V30l-6 4H12V10zm2 3v22h10.5l4-3V14.8L24 12H14z" />
      <path fill="#D35230" d="M16 16h6.5c2.2 0 4 1.5 4 3.5s-1.8 3.5-4 3.5H16V16zm0 8.5h7c2.2 0 4 1.5 4 3.5s-1.8 3.5-4 3.5h-7v-7z" />
    </LogoFrame>
  );
}

function LinkedInLogo({ className }: { className?: string }) {
  return (
    <LogoFrame className={className} label="LinkedIn">
      <rect width="40" height="40" rx="8" fill="#0A66C2" />
      <path
        fill="#fff"
        d="M13.5 17h3v11h-3V17zm1.5-4.5a1.8 1.8 0 110 3.6 1.8 1.8 0 010-3.6zM17.5 17h2.8v1.5c.6-1 2-1.8 3.4-1.8 3.2 0 3.8 2.1 3.8 4.8V28h-3v-5.6c0-1.3 0-3-2-3s-2.3 1.2-2.3 2.4V28h-3V17z"
      />
    </LogoFrame>
  );
}

function OdiloLogo({ className }: { className?: string }) {
  return (
    <LogoFrame className={className} label="Odilo">
      <rect width="40" height="40" rx="8" fill="#111" />
      <circle cx="13" cy="20" r="4" fill="#3DDC84" />
      <path fill="#fff" d="M11.8 19.2l1 1.2 2.4-2.8" stroke="#111" strokeWidth=".4" />
      <text x="18" y="23.5" fill="#fff" fontSize="7.5" fontWeight="700" fontFamily="system-ui,sans-serif">
        ODILO
      </text>
    </LogoFrame>
  );
}

function TeamsLogo({ className }: { className?: string }) {
  return (
    <LogoFrame className={className} label="Microsoft Teams">
      <rect width="40" height="40" rx="8" fill="#464EB8" />
      <circle cx="14" cy="17" r="4" fill="#7B83EB" />
      <path fill="#fff" d="M11.5 22.5c-2.2 0-4 1.2-4 2.7v1.3h8v-1.3c0-1.5-1.8-2.7-4-2.7z" />
      <rect x="20" y="12" width="10" height="16" rx="1.5" fill="#5059C9" />
      <path fill="#fff" d="M22.5 16h5v1.5h-5V16zm0 3h5v1.5h-5V19zm0 3h5v1.5h-5V22z" />
    </LogoFrame>
  );
}

function WhatsAppLogo({ className }: { className?: string }) {
  return (
    <LogoFrame className={className} label="WhatsApp">
      <rect width="40" height="40" rx="8" fill="#25D366" />
      <path
        fill="#fff"
        d="M20 11c-4.9 0-9 4-9 9 0 1.6.4 3.1 1.2 4.4L11 29l4.8-1.2c1.2.7 2.6 1 4.2 1 4.9 0 9-4 9-9s-4.1-9-9-9zm0 16.2c-1.4 0-2.7-.4-3.8-1l-.3-.2-2.8.7.8-2.7-.2-.3c-1-1.2-1.6-2.7-1.6-4.3 0-3.9 3.2-7 7.1-7s7.1 3.1 7.1 7-3.2 7-7.1 7zm3.9-5.3c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1-.2.2-.6.7-.7.9-.1.1-.3.2-.5.1-.2-.1-.9-.3-1.7-1-.6-.5-1-1.2-1.1-1.4-.1-.2 0-.3.1-.4.1-.1.2-.3.3-.4.1-.1.1-.2.2-.3.1-.1 0-.2 0-.3 0-.1-.5-1.3-.7-1.8-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9 0 1.1.8 2.2.9 2.3.1.2 1.6 2.4 3.8 3.4.5.2.9.4 1.2.5.5.2 1 .2 1.4.1.4-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1-.1-.1-.2-.1-.4-.2z"
      />
    </LogoFrame>
  );
}

function OutlookLogo({ className }: { className?: string }) {
  return (
    <LogoFrame className={className} label="Microsoft Outlook">
      <rect width="40" height="40" rx="8" fill="#0078D4" />
      <path fill="#fff" d="M12 13h11l5 3.5V27l-5 3H12V13zm2 2.5v17h9.2l3.5-2.5V17.8L23.2 15H14z" />
      <ellipse cx="18" cy="22" rx="4.5" ry="5" fill="#0078D4" />
      <text x="18" y="24.5" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">
        O
      </text>
    </LogoFrame>
  );
}

function ExcelLogo({ className }: { className?: string }) {
  return (
    <LogoFrame className={className} label="Microsoft Excel">
      <rect width="40" height="40" rx="8" fill="#217346" />
      <path fill="#fff" d="M12 10h12l6 4.5V30l-6 4H12V10zm2 3v22h10.5l4-3V14.8L24 12H14z" />
      <path fill="#217346" d="M16 15h7.5c2.5 0 4.5 1.8 4.5 4s-2 4-4.5 4H16V15zm0 9h8c2.5 0 4.5 1.8 4.5 4s-2 4-4.5 4H16v-8z" />
    </LogoFrame>
  );
}

function WordLogo({ className }: { className?: string }) {
  return (
    <LogoFrame className={className} label="Microsoft Word">
      <rect width="40" height="40" rx="8" fill="#2B579A" />
      <path fill="#fff" d="M12 10h12l6 4.5V30l-6 4H12V10zm2 3v22h10.5l4-3V14.8L24 12H14z" />
      <path fill="#2B579A" d="M16 16h6.8c2.4 0 4.2 1.6 4.2 3.6 0 1.4-.8 2.6-2.1 3.2 1.6.6 2.6 2 2.6 3.7 0 2.3-2 4-4.5 4H16V16zm2.2 2v3.8h4c1 0 1.7-.6 1.7-1.4s-.7-1.4-1.7-1.4h-4zm0 6.2v4.2h4.5c1.1 0 1.9-.7 1.9-1.6s-.8-1.6-1.9-1.6h-4.5z" />
    </LogoFrame>
  );
}

function OfficeLogo({ className }: { className?: string }) {
  return (
    <LogoFrame className={className} label="Microsoft Office">
      <rect width="40" height="40" rx="8" fill="#fff" stroke="#E5E7EB" />
      <rect x="9" y="12" width="10" height="16" rx="1" fill="#D83B01" />
      <path fill="#fff" d="M11.5 16h5v1.2h-5V16zm0 2.4h5v1.2h-5v-1.2zm0 2.4h3.5v1.2h-3.5v-1.2z" />
      <text x="22" y="23" fill="#D83B01" fontSize="6.5" fontWeight="700" fontFamily="system-ui,sans-serif">
        Office
      </text>
    </LogoFrame>
  );
}

function ZoomLogo({ className }: { className?: string }) {
  return (
    <LogoFrame className={className} label="Zoom">
      <rect width="40" height="40" rx="8" fill="#fff" stroke="#E5E7EB" />
      <text x="20" y="24.5" textAnchor="middle" fill="#2D8CFF" fontSize="9" fontWeight="700" fontFamily="system-ui,sans-serif">
        zoom
      </text>
    </LogoFrame>
  );
}

const brandComponents: Record<IntegrationBrand, FC<{ className?: string }>> = {
  notion: NotionLogo,
  "google-meet": GoogleMeetLogo,
  "power-bi": PowerBiLogo,
  gmail: GmailLogo,
  powerpoint: PowerPointLogo,
  linkedin: LinkedInLogo,
  odilo: OdiloLogo,
  teams: TeamsLogo,
  whatsapp: WhatsAppLogo,
  outlook: OutlookLogo,
  excel: ExcelLogo,
  word: WordLogo,
  office: OfficeLogo,
  zoom: ZoomLogo,
};

export function IntegrationBrandLogo({
  brand,
  className = "w-10 h-10",
}: {
  brand: IntegrationBrand;
  className?: string;
}) {
  const Logo = brandComponents[brand];
  return <Logo className={className} />;
}
