// The site's Worker. Serves the static site (out/) and adds:
//   <base>/admin/*      the editor page, only for people Cloudflare Access let in
//   /api/admin/*        read and save content (D1), upload photos (R2), publish (deploy hook)
//   /api/content/export everything the build needs, for the build only (BUILD_TOKEN)
//   /media/*            uploaded photos from R2
// Anything else is a static file. While site-path.json has a base path (the preview at
// /test-website), the placeholder holds the root: other addresses that aren't files are sent
// to / with a temporary redirect, and the preview carries noindex.
import { createRemoteJWKSet, jwtVerify } from "jose";
import { basePath } from "../site-path.json";
import { HOME_FIELDS, PROJECT_FIELDS, SITE_FIELDS, blank, clean, slugify } from "../src/admin/schema";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  MEDIA: R2Bucket;
  ACCESS_TEAM_DOMAIN?: string; // e.g. douglas.cloudflareaccess.com
  ACCESS_AUD?: string; // the Access application's audience tag
  DEPLOY_HOOK_URL?: string; // secret
  BUILD_TOKEN?: string; // secret, shared with the build
  DEV_BYPASS_AUTH?: string; // "1" in .dev.vars only; honoured on localhost only
}

type Doc = Record<string, unknown>;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const fail = (message: string, status = 400) => json({ error: message }, status);

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

/* ---------------------------------------------------------------- auth */

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

/** The signed-in editor's email, or null. Cloudflare Access sits in front of /admin and
 * /api/admin; this checks its token again so a misconfigured Access policy fails closed. */
async function editor(request: Request, env: Env): Promise<string | null> {
  const url = new URL(request.url);
  if (env.DEV_BYPASS_AUTH === "1" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) return "dev@localhost";
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return null;
  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token) return null;
  jwks ??= createRemoteJWKSet(new URL(`https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`));
  try {
    const { payload } = await jwtVerify(token, jwks, { issuer: `https://${env.ACCESS_TEAM_DOMAIN}`, audience: env.ACCESS_AUD });
    return typeof payload.email === "string" ? payload.email : "unknown";
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------- content */

async function getDoc(env: Env, id: string): Promise<Doc | null> {
  const row = await env.DB.prepare("SELECT data FROM documents WHERE id = ?").bind(id).first<{ data: string }>();
  return row ? (JSON.parse(row.data) as Doc) : null;
}

async function putDoc(env: Env, id: string, data: Doc, by: string) {
  await env.DB.prepare(
    "INSERT INTO documents (id, data, updated_at, updated_by) VALUES (?1, ?2, datetime('now'), ?3) " +
      "ON CONFLICT(id) DO UPDATE SET data = ?2, updated_at = datetime('now'), updated_by = ?3",
  )
    .bind(id, JSON.stringify(data), by)
    .run();
}

async function allContent(env: Env) {
  const { results } = await env.DB.prepare("SELECT id, data FROM documents").all<{ id: string; data: string }>();
  const docs = new Map(results.map((r) => [r.id, JSON.parse(r.data) as Doc]));
  const projects = [...docs.entries()]
    .filter(([id]) => id.startsWith("project:"))
    .map(([id, data]): Doc => ({ ...data, slug: id.slice("project:".length) }))
    .sort((a, b) => Number(a.order ?? 999) - Number(b.order ?? 999));
  return { site: docs.get("site") ?? null, home: docs.get("home") ?? null, projects };
}

/* ---------------------------------------------------------------- admin API */

async function adminApi(request: Request, env: Env, path: string, who: string): Promise<Response> {
  const method = request.method;

  // Everything the editor shows, plus save/publish state.
  if (path === "content" && method === "GET") {
    const content = await allContent(env);
    const status = await env.DB.prepare(
      "SELECT (SELECT max(updated_at) FROM documents) AS saved, (SELECT max(at) FROM publishes) AS published",
    ).first<{ saved: string | null; published: string | null }>();
    return json({ ...content, status, editor: who });
  }

  // Save business details or the home page.
  const docMatch = path.match(/^docs\/(site|home)$/);
  if (docMatch && method === "PUT") {
    const fields = docMatch[1] === "site" ? SITE_FIELDS : HOME_FIELDS;
    try {
      await putDoc(env, docMatch[1], clean(fields, await request.json()), who);
    } catch (e) {
      return fail((e as Error).message);
    }
    return json({ ok: true });
  }

  // Create a project from its title; the slug (page address) is fixed from then on.
  if (path === "projects" && method === "POST") {
    const body = (await request.json().catch(() => ({}))) as { title?: string };
    const title = (body.title ?? "").trim();
    if (!title) return fail("Give the project a name.");
    let slug = slugify(title);
    for (let n = 2; await getDoc(env, `project:${slug}`); n++) slug = `${slugify(title)}-${n}`;
    const max = await env.DB.prepare(
      "SELECT max(CAST(json_extract(data, '$.order') AS INTEGER)) AS m FROM documents WHERE id LIKE 'project:%'",
    ).first<{ m: number | null }>();
    await putDoc(env, `project:${slug}`, { ...blank(PROJECT_FIELDS), title, order: (max?.m ?? 0) + 1 }, who);
    return json({ ok: true, slug });
  }

  // Order of projects on the home page: body = slugs in the new order.
  if (path === "projects/order" && method === "PUT") {
    const slugs = (await request.json()) as unknown;
    if (!Array.isArray(slugs)) return fail("Expected a list of projects.");
    const stmts = [];
    for (const [i, slug] of slugs.entries()) {
      stmts.push(
        env.DB.prepare(
          "UPDATE documents SET data = json_set(data, '$.order', ?1), updated_at = datetime('now'), updated_by = ?2 WHERE id = ?3",
        ).bind(i + 1, who, `project:${String(slug)}`),
      );
    }
    if (stmts.length) await env.DB.batch(stmts);
    return json({ ok: true });
  }

  const projectMatch = path.match(/^projects\/([a-z0-9-]+)$/);
  if (projectMatch) {
    const id = `project:${projectMatch[1]}`;
    const existing = await getDoc(env, id);
    if (!existing) return fail("That project no longer exists.", 404);
    if (method === "PUT") {
      try {
        await putDoc(env, id, { ...clean(PROJECT_FIELDS, await request.json()), order: existing.order ?? 999 }, who);
      } catch (e) {
        return fail((e as Error).message);
      }
      return json({ ok: true });
    }
    if (method === "DELETE") {
      await env.DB.prepare("DELETE FROM documents WHERE id = ?").bind(id).run();
      return json({ ok: true });
    }
  }

  // Photo upload: stored in R2, served from /media/.
  if (path === "media" && method === "POST") {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("No photo was sent.");
    if (!IMAGE_TYPES.has(file.type)) return fail("Please upload a JPG, PNG, WebP, GIF or AVIF photo.");
    if (file.size > MAX_UPLOAD_BYTES) return fail("That photo is over 15 MB. Please send a smaller copy.");
    const now = new Date();
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "").slice(-60) || "photo";
    const key = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID().slice(0, 8)}-${safe}`;
    await env.MEDIA.put(key, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { uploadedBy: who } });
    return json({ ok: true, url: `/media/${key}` });
  }

  // Publish: start a build; the build pulls this content and deploys the new static site.
  if (path === "publish" && method === "POST") {
    if (!env.DEPLOY_HOOK_URL) return fail("Publishing isn't set up yet (no deploy hook).", 501);
    const res = await fetch(env.DEPLOY_HOOK_URL, { method: "POST" });
    const body = (await res.json().catch(() => ({}))) as { result?: { build_uuid?: string } };
    if (!res.ok) return fail("Cloudflare didn't accept the publish request. Try again in a minute.", 502);
    await env.DB.prepare("INSERT INTO publishes (build_uuid, by) VALUES (?, ?)").bind(body.result?.build_uuid ?? null, who).run();
    return json({ ok: true });
  }

  return fail("Not found", 404);
}

/* ---------------------------------------------------------------- entry */

const ADMIN = `${basePath}/admin`;

function withHeaders(res: Response, extra: Record<string, string>) {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(extra)) headers.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // One address for the site: www.<domain> goes to <domain>, keeping the path.
    if (url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.slice("www.".length);
      return Response.redirect(url.toString(), 301);
    }

    if (path.startsWith("/media/")) {
      const key = decodeURIComponent(path.slice("/media/".length));
      const object = await env.MEDIA.get(key);
      if (!object) return new Response("Not found", { status: 404 });
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("cache-control", "public, max-age=31536000, immutable");
      return new Response(object.body, { headers });
    }

    if (path === "/api/content/export") {
      const auth = request.headers.get("authorization");
      const ok = (env.BUILD_TOKEN && auth === `Bearer ${env.BUILD_TOKEN}`) || (await editor(request, env));
      if (!ok) return fail("Forbidden", 403);
      return json(await allContent(env));
    }

    if (path === ADMIN || path.startsWith(`${ADMIN}/`) || path.startsWith("/api/admin/")) {
      const who = await editor(request, env);
      if (!who) return new Response("Forbidden: sign in through the website's login.", { status: 403 });
      if (path.startsWith("/api/admin/")) {
        if (request.method !== "GET" && request.headers.get("x-requested-with") !== "admin") return fail("Bad request", 400);
        return adminApi(request, env, path.slice("/api/admin/".length), who);
      }
      return withHeaders(await env.ASSETS.fetch(request), { "cache-control": "no-store", "x-robots-tag": "noindex" });
    }

    if (path.startsWith("/api/")) return fail("Not found", 404);
    if (!basePath) return env.ASSETS.fetch(request);

    // Preview mode.
    if (path === basePath || path.startsWith(`${basePath}/`)) {
      return withHeaders(await env.ASSETS.fetch(request), { "x-robots-tag": "noindex" });
    }
    const res = await env.ASSETS.fetch(request);
    if (res.status === 404) return new Response(null, { status: 302, headers: { location: "/", "cache-control": "no-store" } });
    return res;
  },
} satisfies ExportedHandler<Env>;
