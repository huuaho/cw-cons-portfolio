// After `next build`: arrange out/ to match the URLs the Worker serves.
// While site-path.json has a base path (e.g. "/test-website"):
//   - the site's pages and Next's files move to out/test-website/
//   - public/ files (photos, fonts) stay at the root, where pages and content point to them
//   - the under-construction placeholder (../under-construction) goes at the root
// With no base path (launch), out/ is left as it is.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(web, "out");
const { basePath } = JSON.parse(readFileSync(join(web, "site-path.json"), "utf8"));

if (!basePath) process.exit(0);

const target = join(out, basePath);
const keepAtRoot = new Set(readdirSync(join(web, "public")));
const placeholder = join(web, "..", "under-construction");
if (!existsSync(placeholder)) {
  console.error(`place-site: ${placeholder} is missing; the root would have no page.`);
  process.exit(1);
}

mkdirSync(target, { recursive: true });
const top = basePath.split("/")[1];
for (const name of readdirSync(out)) {
  if (name === top || keepAtRoot.has(name)) continue;
  renameSync(join(out, name), join(target, name));
}
for (const name of readdirSync(placeholder)) {
  if (keepAtRoot.has(name) && name !== "fonts") throw new Error(`place-site: placeholder file "${name}" clashes with public/${name}`);
  cpSync(join(placeholder, name), join(out, name), { recursive: true });
}
console.log(`place-site: site under ${basePath}/, placeholder at /`);
