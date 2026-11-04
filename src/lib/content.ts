// Reads the files Pages CMS edits (content/). Runs at build time only.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export { paragraphs, telHref } from "./format";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type ServiceIconName =
  | "house"
  | "ruler"
  | "bath"
  | "hard-hat"
  | "shovel"
  | "building"
  | "hammer"
  | "paint-roller"
  | "wrench"
  | "drill";

export type SiteSettings = {
  companyName: string;
  logoText: string;
  phone: string;
  email: string;
  address: string;
  showAddressOnMap: boolean;
  hours: string;
  serviceAreas: string[];
  social: { facebook: string; instagram: string; google: string };
  seo: { title: string; description: string };
};

export type HomeContent = {
  hero: {
    headline: string;
    headlineEmphasis: string;
    subheading: string;
    buttonLabel: string;
    buttonAction: "quote" | "call";
    image: string;
  };
  services: {
    heading: string;
    intro: string;
    items: { title: string; description: string; icon: ServiceIconName }[];
  };
  portfolio: { heading: string; intro: string };
  about: {
    heading: string;
    intro: string;
    story: string;
    image: string;
    yearsInBusiness: number;
    credentials: { title: string; detail: string; year: string }[];
  };
  stats: { show: boolean; heading: string; intro: string; items: { label: string; percent: number }[] };
  testimonials: {
    show: boolean;
    heading: string;
    intro: string;
    items: { name: string; role: string; quote: string; photo: string }[];
  };
  news: {
    show: boolean;
    heading: string;
    intro: string;
    items: { title: string; date: string; author: string; category: string; image: string; link: string }[];
  };
  contact: { heading: string; intro: string };
};

export type ProjectLayout = "carousel" | "wide" | "side";

export type Project = {
  slug: string;
  title: string;
  category: string;
  location: string;
  year: number | string;
  order: number;
  layout: ProjectLayout;
  client: string;
  link: string;
  cover: string;
  photos: string[];
  description: string;
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), "utf8")) as T;
}

export function getSite(): SiteSettings {
  return readJson<SiteSettings>("site.json");
}

export function getHome(): HomeContent {
  return readJson<HomeContent>("home.json");
}

export function getProjects(): Project[] {
  const dir = path.join(CONTENT_DIR, "projects");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { data } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      return {
        slug: file.replace(/\.md$/, ""),
        title: data.title ?? "Untitled project",
        category: data.category ?? "",
        location: data.location ?? "",
        year: data.year ?? "",
        order: typeof data.order === "number" ? data.order : 999,
        layout: ["carousel", "wide", "side"].includes(data.layout) ? data.layout : "carousel",
        client: data.client ?? "",
        link: data.link ?? "",
        cover: data.cover ?? data.photos?.[0] ?? "",
        photos: (data.photos ?? []).filter(Boolean),
        description: data.description ?? "",
      } satisfies Project;
    })
    .sort((a, b) => a.order - b.order || String(b.year).localeCompare(String(a.year)));
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}
