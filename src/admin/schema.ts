// What the client can edit, described once. The admin forms are generated from these fields and
// the Worker validates every save against them, so the two cannot drift apart. Field names must
// match the types in src/lib/content.ts; icon values must match src/components/ServiceIcon.tsx.

export type Field =
  | { type: "string" | "text" | "number" | "boolean" | "date" | "image"; name: string; label: string; help?: string; required?: boolean }
  | { type: "select"; name: string; label: string; help?: string; options: { value: string; label: string }[] }
  | { type: "images"; name: string; label: string; help?: string; max?: number }
  | { type: "strings"; name: string; label: string; help?: string }
  | { type: "object"; name: string; label: string; help?: string; fields: Field[] }
  | { type: "list"; name: string; label: string; help?: string; fields: Field[]; summary: string; max?: number };

const heading = (): Field[] => [
  { type: "string", name: "heading", label: "Heading" },
  { type: "string", name: "intro", label: "Intro line" },
];
const show: Field = { type: "boolean", name: "show", label: "Show this section on the site" };

export const SERVICE_ICONS = [
  { value: "house", label: "House" },
  { value: "ruler", label: "Ruler" },
  { value: "bath", label: "Bath" },
  { value: "hard-hat", label: "Hard hat" },
  { value: "shovel", label: "Shovel" },
  { value: "building", label: "Building" },
  { value: "hammer", label: "Hammer" },
  { value: "paint-roller", label: "Paint roller" },
  { value: "wrench", label: "Wrench" },
  { value: "drill", label: "Drill" },
];

export const SITE_FIELDS: Field[] = [
  { type: "string", name: "companyName", label: "Company name", required: true },
  { type: "string", name: "logoText", label: "Logo text (top left)" },
  { type: "string", name: "phone", label: "Phone" },
  { type: "string", name: "email", label: "Email" },
  { type: "string", name: "address", label: "Address or area" },
  { type: "boolean", name: "showAddressOnMap", label: "Show a map of this address" },
  { type: "string", name: "hours", label: "Business hours" },
  { type: "strings", name: "serviceAreas", label: "Areas you serve" },
  {
    type: "object",
    name: "social",
    label: "Social and review links",
    fields: [
      { type: "string", name: "facebook", label: "Facebook page link" },
      { type: "string", name: "instagram", label: "Instagram link" },
      { type: "string", name: "google", label: "Google Business Profile link" },
    ],
  },
  {
    type: "object",
    name: "seo",
    label: "Search results",
    fields: [
      { type: "string", name: "title", label: "Title shown in Google" },
      { type: "text", name: "description", label: "Description shown in Google" },
    ],
  },
];

export const HOME_FIELDS: Field[] = [
  {
    type: "object",
    name: "hero",
    label: "Top of the page",
    fields: [
      { type: "string", name: "headline", label: "Headline (first part)" },
      { type: "string", name: "headlineEmphasis", label: "Headline (bold part)" },
      { type: "text", name: "subheading", label: "Tagline" },
      { type: "string", name: "buttonLabel", label: "Button text" },
      {
        type: "select",
        name: "buttonAction",
        label: "Button action",
        options: [
          { value: "quote", label: "Go to the quote form" },
          { value: "call", label: "Call the phone number" },
        ],
      },
      { type: "image", name: "image", label: "Photo" },
    ],
  },
  { type: "object", name: "portfolio", label: "Our work section", fields: heading() },
  {
    type: "object",
    name: "services",
    label: "Services section",
    fields: [
      ...heading(),
      {
        type: "list",
        name: "items",
        label: "Services",
        summary: "title",
        fields: [
          { type: "string", name: "title", label: "Service" },
          { type: "text", name: "description", label: "Description" },
          { type: "select", name: "icon", label: "Icon", options: SERVICE_ICONS },
        ],
      },
    ],
  },
  {
    type: "object",
    name: "about",
    label: "About section",
    fields: [
      ...heading(),
      { type: "text", name: "story", label: "Our story", help: "Leave a blank line between paragraphs." },
      { type: "image", name: "image", label: "Photo" },
      { type: "number", name: "yearsInBusiness", label: "Years in business", help: "Set to 0 to hide the box." },
      {
        type: "list",
        name: "credentials",
        label: "Licences, insurance and memberships",
        summary: "title",
        fields: [
          { type: "string", name: "title", label: "Title" },
          { type: "string", name: "detail", label: "Detail" },
          { type: "string", name: "year", label: "Year or status" },
        ],
      },
    ],
  },
  {
    type: "object",
    name: "stats",
    label: "By the numbers (percentage rings)",
    fields: [
      show,
      ...heading(),
      {
        type: "list",
        name: "items",
        label: "Figures",
        summary: "label",
        max: 4,
        fields: [
          { type: "string", name: "label", label: "Label" },
          { type: "number", name: "percent", label: "Percentage (0–100)" },
        ],
      },
    ],
  },
  {
    type: "object",
    name: "testimonials",
    label: "Testimonials",
    fields: [
      show,
      ...heading(),
      {
        type: "list",
        name: "items",
        label: "Reviews",
        summary: "name",
        fields: [
          { type: "string", name: "name", label: "Client name" },
          { type: "string", name: "role", label: "Project or town" },
          { type: "text", name: "quote", label: "What they said" },
          { type: "image", name: "photo", label: "Photo" },
        ],
      },
    ],
  },
  {
    type: "object",
    name: "news",
    label: "News",
    fields: [
      show,
      ...heading(),
      {
        type: "list",
        name: "items",
        label: "Posts",
        summary: "title",
        max: 4,
        fields: [
          { type: "string", name: "title", label: "Title" },
          { type: "date", name: "date", label: "Date" },
          { type: "string", name: "author", label: "Author" },
          { type: "string", name: "category", label: "Category" },
          { type: "image", name: "image", label: "Photo" },
          { type: "string", name: "link", label: "Link (optional)" },
        ],
      },
    ],
  },
  { type: "object", name: "contact", label: "Contact section", fields: heading() },
];

export const PROJECT_FIELDS: Field[] = [
  { type: "string", name: "title", label: "Project name", required: true },
  { type: "string", name: "category", label: "Type of work", help: "e.g. Renovation, Addition, Roofing" },
  { type: "string", name: "location", label: "Town" },
  { type: "number", name: "year", label: "Year" },
  {
    type: "select",
    name: "layout",
    label: "Page layout",
    options: [
      { value: "carousel", label: "Photo slider" },
      { value: "wide", label: "One wide photo" },
      { value: "side", label: "Photo beside the details" },
    ],
  },
  { type: "string", name: "client", label: "Client", help: "Optional, e.g. Private homeowner." },
  { type: "string", name: "link", label: "Link (shown as Visit)", help: "Optional web address." },
  { type: "image", name: "cover", label: "Cover photo (shown on the home page)" },
  { type: "images", name: "photos", label: "Project photos", max: 20 },
  { type: "text", name: "description", label: "Description", help: "Leave a blank line between paragraphs." },
];

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

/** Coerces `value` to the shape `fields` describe, dropping anything else. Throws on a missing required field. */
export function clean(fields: Field[], value: unknown): Record<string, Json> {
  const src = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const out: Record<string, Json> = {};
  for (const f of fields) {
    const v = src[f.name];
    switch (f.type) {
      case "string":
      case "text":
      case "date":
      case "image":
        out[f.name] = typeof v === "string" ? v.trim().slice(0, f.type === "text" ? 5000 : 500) : "";
        if ("required" in f && f.required && !out[f.name]) throw new Error(`${f.label} is required.`);
        break;
      case "number": {
        const n = typeof v === "number" ? v : Number(v);
        out[f.name] = Number.isFinite(n) ? n : 0;
        break;
      }
      case "boolean":
        out[f.name] = v === true;
        break;
      case "select":
        out[f.name] = f.options.some((o) => o.value === v) ? (v as string) : f.options[0].value;
        break;
      case "images":
      case "strings":
        out[f.name] = (Array.isArray(v) ? v : [])
          .filter((x): x is string => typeof x === "string" && x.trim() !== "")
          .map((x) => x.trim().slice(0, 500))
          .slice(0, f.type === "images" ? (f.max ?? 50) : 50);
        break;
      case "object":
        out[f.name] = clean(f.fields, v);
        break;
      case "list":
        out[f.name] = (Array.isArray(v) ? v : []).slice(0, f.max ?? 50).map((item) => clean(f.fields, item));
        break;
    }
  }
  return out;
}

/** An empty value of the right shape, for new projects and new list items. */
export function blank(fields: Field[]): Record<string, Json> {
  return clean(fields, {});
}

/** URL-safe slug from a project title. */
export function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "project"
  );
}
