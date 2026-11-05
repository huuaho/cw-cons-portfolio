"use client";

// The client's website editor at <base path>/admin (behind Cloudflare Access). Edits are saved to the
// database straight away; Publish rebuilds the public site with them (about 1–2 minutes).
import { useCallback, useEffect, useState } from "react";
import { HOME_FIELDS, PROJECT_FIELDS, SITE_FIELDS, type Field } from "@/admin/schema";
import { page } from "@/lib/base-path";
import { api } from "./api";
import FieldEditor from "./FieldEditor";

type Doc = Record<string, unknown>;
type Project = Doc & { slug: string; title?: string; category?: string; year?: number };
type Content = {
  site: Doc | null;
  home: Doc | null;
  projects: Project[];
  status: { saved: string | null; published: string | null };
  editor: string;
};
type Tab = "site" | "home" | "projects";

const when = (sqlTime: string | null) =>
  sqlTime ? new Date(sqlTime.replace(" ", "T") + "Z").toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "never";

function DocForm({ fields, initial, onSave, sections }: { fields: Field[]; initial: Doc; onSave: (d: Doc) => Promise<void>; sections?: boolean }) {
  const [draft, setDraft] = useState(initial);
  const [state, setState] = useState<{ busy: boolean; msg: string; error: boolean }>({ busy: false, msg: "", error: false });
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    setState({ busy: true, msg: "", error: false });
    try {
      await onSave(draft);
      setState({ busy: false, msg: "Saved. Press Publish to put it on the live site.", error: false });
    } catch (e) {
      setState({ busy: false, msg: (e as Error).message, error: true });
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      {sections
        ? fields.map((f) =>
            f.type === "object" ? (
              <details key={f.name} className="admin-section">
                <summary>{f.label}</summary>
                <div className="admin-section__body">
                  <FieldEditor fields={f.fields} value={(draft[f.name] as Doc) ?? {}} onChange={(v) => setDraft({ ...draft, [f.name]: v })} />
                </div>
              </details>
            ) : null,
          )
        : <FieldEditor fields={fields} value={draft} onChange={setDraft} />}
      <div className="admin-savebar">
        <button type="submit" className="btn btn-primary" disabled={!dirty || state.busy}>
          {state.busy ? "Saving…" : "Save changes"}
        </button>
        {dirty && !state.busy && <span className="text-warning-emphasis small">Unsaved changes</span>}
        {state.msg && <span className={`small ${state.error ? "text-danger" : "text-success"}`} role="status">{state.msg}</span>}
      </div>
    </form>
  );
}

function Projects({ projects, reload }: { projects: Project[]; reload: () => Promise<void> }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState("");

  const run = async (fn: () => Promise<unknown>) => {
    setError("");
    try {
      await fn();
      await reload();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const current = projects.find((p) => p.slug === editing);
  if (current) {
    const { slug, order, ...data } = current;
    void order;
    return (
      <div>
        <button type="button" className="btn btn-sm btn-link px-0 mb-3" onClick={() => setEditing(null)}>
          ← All projects
        </button>
        <h2 className="h4 mb-1">{current.title || "Untitled project"}</h2>
        <p className="small text-body-secondary mb-4">Page address: /projects/{slug}/</p>
        <DocForm
          key={slug}
          fields={PROJECT_FIELDS}
          initial={data}
          onSave={async (d) => {
            await api(`projects/${slug}`, { method: "PUT", body: JSON.stringify(d) });
            await reload();
          }}
        />
      </div>
    );
  }

  const order = (slugs: string[]) => run(() => api("projects/order", { method: "PUT", body: JSON.stringify(slugs) }));
  const slugs = projects.map((p) => p.slug);

  return (
    <div>
      <p className="text-body-secondary">Projects show on the home page in this order.</p>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <ul className="list-group mb-4">
        {projects.map((p, i) => (
          <li key={p.slug} className="list-group-item d-flex align-items-center gap-3 flex-wrap">
            {typeof p.cover === "string" && p.cover ? <img src={p.cover} alt="" className="admin-thumb admin-thumb--sm" /> : <div className="admin-thumb admin-thumb--sm admin-thumb--empty" />}
            <div className="flex-grow-1">
              <strong>{p.title || "Untitled project"}</strong>
              <div className="small text-body-secondary">{[p.category, p.year].filter(Boolean).join(" · ")}</div>
            </div>
            {confirmDelete === p.slug ? (
              <span className="d-flex gap-2 align-items-center">
                <span className="small">Delete this project?</span>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => run(() => api(`projects/${p.slug}`, { method: "DELETE" }))}>Delete</button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setConfirmDelete(null)}>Keep</button>
              </span>
            ) : (
              <span className="btn-group btn-group-sm">
                <button type="button" className="btn btn-outline-secondary" aria-label="Move up" disabled={i === 0} onClick={() => { const s = [...slugs]; [s[i - 1], s[i]] = [s[i], s[i - 1]]; order(s); }}>↑</button>
                <button type="button" className="btn btn-outline-secondary" aria-label="Move down" disabled={i === projects.length - 1} onClick={() => { const s = [...slugs]; [s[i + 1], s[i]] = [s[i], s[i + 1]]; order(s); }}>↓</button>
                <button type="button" className="btn btn-outline-primary" onClick={() => setEditing(p.slug)}>Edit</button>
                <button type="button" className="btn btn-outline-danger" onClick={() => setConfirmDelete(p.slug)}>Delete</button>
              </span>
            )}
          </li>
        ))}
      </ul>
      <form
        className="d-flex gap-2 admin-wide"
        onSubmit={(e) => {
          e.preventDefault();
          const title = newTitle.trim();
          if (!title) return;
          run(async () => {
            const { slug } = await api<{ slug: string }>("projects", { method: "POST", body: JSON.stringify({ title }) });
            setNewTitle("");
            setEditing(slug);
          });
        }}
      >
        <input className="form-control" placeholder="New project name" aria-label="New project name" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        <button type="submit" className="btn btn-primary text-nowrap">Add project</button>
      </form>
    </div>
  );
}

export default function AdminApp() {
  const [content, setContent] = useState<Content | null>(null);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState<Tab>("projects");
  const [publish, setPublish] = useState<{ busy: boolean; msg: string; error: boolean }>({ busy: false, msg: "", error: false });

  const reload = useCallback(async () => {
    try {
      setContent(await api<Content>("content"));
      setLoadError("");
    } catch (e) {
      setLoadError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    // Initial load of the editor's content.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  async function doPublish() {
    setPublish({ busy: true, msg: "", error: false });
    try {
      await api("publish", { method: "POST" });
      setPublish({ busy: false, msg: "Publishing. The live site updates in about 2 minutes.", error: false });
      await reload();
    } catch (e) {
      setPublish({ busy: false, msg: (e as Error).message, error: true });
    }
  }

  if (loadError) return <div className="container py-5"><div className="alert alert-danger">{loadError}</div></div>;
  if (!content) return <div className="container py-5">Loading…</div>;

  const { saved, published } = content.status;
  const unpublished = saved && (!published || saved > published);

  return (
    <div className="container py-4 admin">
      <header className="d-flex flex-wrap align-items-center gap-3 mb-4">
        <div className="flex-grow-1">
          <h1 className="h3 mb-0">Website editor</h1>
          <div className="small text-body-secondary">Signed in as {content.editor}</div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <a href={page("/")} target="_blank" rel="noopener" className="btn btn-outline-secondary btn-sm">View live site</a>
          <button type="button" className="btn btn-primary" onClick={doPublish} disabled={publish.busy}>
            {publish.busy ? "Publishing…" : "Publish"}
          </button>
        </div>
        <div className="small w-100">
          {unpublished ? (
            <span className="text-warning-emphasis">Saved changes aren&apos;t on the live site yet</span>
          ) : (
            <span className="text-body-secondary">Live site is up to date</span>
          )}
          <span className="text-body-secondary"> · last published {when(published)}</span>
        </div>
      </header>
      {publish.msg && <div className={`alert py-2 ${publish.error ? "alert-danger" : "alert-success"}`} role="status">{publish.msg}</div>}

      <ul className="nav nav-tabs mb-4">
        {(
          [
            ["projects", "Projects"],
            ["home", "Home page"],
            ["site", "Business details"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <li key={key} className="nav-item">
            <button type="button" className={`nav-link${tab === key ? " active" : ""}`} aria-current={tab === key ? "page" : undefined} onClick={() => setTab(key)}>
              {label}
            </button>
          </li>
        ))}
      </ul>

      {tab === "projects" && <Projects projects={content.projects} reload={reload} />}
      {tab === "home" &&
        (content.home ? (
          <DocForm key="home" sections fields={HOME_FIELDS} initial={content.home} onSave={async (d) => { await api("docs/home", { method: "PUT", body: JSON.stringify(d) }); await reload(); }} />
        ) : (
          <p>No home page content yet.</p>
        ))}
      {tab === "site" &&
        (content.site ? (
          <DocForm key="site" fields={SITE_FIELDS} initial={content.site} onSave={async (d) => { await api("docs/site", { method: "PUT", body: JSON.stringify(d) }); await reload(); }} />
        ) : (
          <p>No business details yet.</p>
        ))}
    </div>
  );
}
