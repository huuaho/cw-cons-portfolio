// Prints SQL that loads content/ (site.json, home.json, projects/*.md) into D1.
// Used once to start the database from the files in the repo:
//   node scripts/seed-content.mjs > .wrangler/seed.sql && wrangler d1 execute DB --local --file .wrangler/seed.sql
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const dir = path.join(process.cwd(), "content");
const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const rows = [
  ["site", JSON.parse(fs.readFileSync(path.join(dir, "site.json"), "utf8"))],
  ["home", JSON.parse(fs.readFileSync(path.join(dir, "home.json"), "utf8"))],
];
for (const file of fs.readdirSync(path.join(dir, "projects")).filter((f) => f.endsWith(".md"))) {
  const { data } = matter(fs.readFileSync(path.join(dir, "projects", file), "utf8"));
  rows.push([`project:${file.replace(/\.md$/, "")}`, data]);
}
for (const [id, data] of rows) {
  console.log(
    `INSERT INTO documents (id, data, updated_by) VALUES (${q(id)}, ${q(JSON.stringify(data))}, 'seed') ` +
      `ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = datetime('now'), updated_by = 'seed';`,
  );
}
