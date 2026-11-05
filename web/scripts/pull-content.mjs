// Before `next build`: fetch the content saved in the editor (D1, via the live Worker) and write it
// into content/ for the build. Without CONTENT_EXPORT_URL (e.g. on a laptop) the files already in
// content/ are used as they are.
//   CONTENT_EXPORT_URL  e.g. https://douglasconstructionsolutions.com/api/content/export
//   BUILD_TOKEN         the same secret the Worker has
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const url = process.env.CONTENT_EXPORT_URL;
if (!url) {
  console.log("pull-content: CONTENT_EXPORT_URL not set; building from the content/ files in the repo.");
  process.exit(0);
}

const res = await fetch(url, { headers: { authorization: `Bearer ${process.env.BUILD_TOKEN ?? ""}` } });
if (!res.ok) {
  console.error(`pull-content: ${url} answered ${res.status}; stopping so the live site is not replaced with stale content.`);
  process.exit(1);
}
const { site, home, projects } = await res.json();
if (!site || !home) {
  console.error("pull-content: the database has no site or home content yet; seed it first.");
  process.exit(1);
}

const dir = path.join(process.cwd(), "content");
fs.writeFileSync(path.join(dir, "site.json"), JSON.stringify(site, null, 2) + "\n");
fs.writeFileSync(path.join(dir, "home.json"), JSON.stringify(home, null, 2) + "\n");
const pdir = path.join(dir, "projects");
for (const f of fs.readdirSync(pdir)) if (f.endsWith(".md")) fs.unlinkSync(path.join(pdir, f));
for (const { slug, ...data } of projects) fs.writeFileSync(path.join(pdir, `${slug}.md`), matter.stringify("", data));
console.log(`pull-content: wrote site, home and ${projects.length} projects.`);
