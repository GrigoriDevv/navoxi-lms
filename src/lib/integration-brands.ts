export const INTEGRATION_BRANDS = [
  "notion",
  "google-meet",
  "power-bi",
  "gmail",
  "powerpoint",
  "linkedin",
  "odilo",
  "teams",
  "whatsapp",
  "outlook",
  "excel",
  "word",
  "office",
  "zoom",
] as const;

export type IntegrationBrand = (typeof INTEGRATION_BRANDS)[number];

export const integrationBrandLabels: Record<IntegrationBrand, string> = {
  notion: "Notion",
  "google-meet": "Google Meet",
  "power-bi": "Power BI",
  gmail: "Gmail",
  powerpoint: "Microsoft PowerPoint",
  linkedin: "LinkedIn",
  odilo: "Odilo",
  teams: "Microsoft Teams",
  whatsapp: "WhatsApp",
  outlook: "Microsoft Outlook",
  excel: "Microsoft Excel",
  word: "Microsoft Word",
  office: "Microsoft Office",
  zoom: "Zoom",
};
