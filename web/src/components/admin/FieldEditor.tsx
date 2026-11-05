"use client";

// Renders an editing form from the field list in src/admin/schema.ts.
import { useId, useRef, useState } from "react";
import { blank, type Field } from "@/admin/schema";
import { uploadPhoto } from "./api";

type Value = Record<string, unknown>;

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function UploadButton({ label, multiple, onUploaded }: { label: string; multiple?: boolean; onUploaded: (urls: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        multiple={multiple}
        hidden
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (!files.length) return;
          setBusy(true);
          setError("");
          try {
            const urls: string[] = [];
            for (const f of files) urls.push(await uploadPhoto(f));
            onUploaded(urls);
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      />
      <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? "Uploading…" : label}
      </button>
      {error && <div className="text-danger small mt-1">{error}</div>}
    </>
  );
}

function FieldInput({ field, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) {
  const id = useId();
  const help = field.help && <div className="form-text">{field.help}</div>;

  switch (field.type) {
    case "string":
    case "date":
      return (
        <div className="mb-3">
          <label className="form-label" htmlFor={id}>{field.label}</label>
          <input id={id} className="form-control" type={field.type === "date" ? "date" : "text"} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
          {help}
        </div>
      );
    case "text":
      return (
        <div className="mb-3">
          <label className="form-label" htmlFor={id}>{field.label}</label>
          <textarea id={id} className="form-control" rows={4} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
          {help}
        </div>
      );
    case "number":
      return (
        <div className="mb-3">
          <label className="form-label" htmlFor={id}>{field.label}</label>
          <input id={id} className="form-control admin-narrow" type="number" value={String(value ?? 0)} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} />
          {help}
        </div>
      );
    case "boolean":
      return (
        <div className="form-check form-switch mb-3">
          <input id={id} className="form-check-input" type="checkbox" role="switch" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
          <label className="form-check-label" htmlFor={id}>{field.label}</label>
          {help}
        </div>
      );
    case "select":
      return (
        <div className="mb-3">
          <label className="form-label" htmlFor={id}>{field.label}</label>
          <select id={id} className="form-select admin-narrow" value={(value as string) ?? field.options[0].value} onChange={(e) => onChange(e.target.value)}>
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {help}
        </div>
      );
    case "image": {
      const src = (value as string) || "";
      return (
        <div className="mb-3">
          <div className="form-label">{field.label}</div>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            {src ? <img src={src} alt="" className="admin-thumb" /> : <div className="admin-thumb admin-thumb--empty">No photo</div>}
            <div className="d-flex gap-2 flex-wrap align-items-start">
              <UploadButton label={src ? "Replace photo" : "Upload photo"} onUploaded={([url]) => onChange(url)} />
              {src && (
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onChange("")}>Remove</button>
              )}
            </div>
          </div>
          {help}
        </div>
      );
    }
    case "images": {
      const list = (value as string[]) ?? [];
      const full = field.max !== undefined && list.length >= field.max;
      return (
        <div className="mb-3">
          <div className="form-label">{field.label}</div>
          <div className="admin-photos">
            {list.map((src, i) => (
              <figure key={src + i} className="admin-photo">
                <img src={src} alt="" className="admin-thumb" />
                <figcaption className="btn-group btn-group-sm">
                  <button type="button" className="btn btn-outline-secondary" aria-label="Move earlier" onClick={() => onChange(move(list, i, i - 1))} disabled={i === 0}>←</button>
                  <button type="button" className="btn btn-outline-secondary" aria-label="Move later" onClick={() => onChange(move(list, i, i + 1))} disabled={i === list.length - 1}>→</button>
                  <button type="button" className="btn btn-outline-danger" aria-label="Remove photo" onClick={() => onChange(list.filter((_, j) => j !== i))}>✕</button>
                </figcaption>
              </figure>
            ))}
          </div>
          {!full && <UploadButton label="Add photos" multiple onUploaded={(urls) => onChange([...list, ...urls].slice(0, field.max ?? 50))} />}
          {help}
        </div>
      );
    }
    case "strings": {
      const list = (value as string[]) ?? [];
      return (
        <div className="mb-3">
          <div className="form-label">{field.label}</div>
          {list.map((s, i) => (
            <div key={i} className="input-group mb-2 admin-wide">
              <input className="form-control" value={s} aria-label={`${field.label} ${i + 1}`} onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))} />
              <button type="button" className="btn btn-outline-danger" aria-label="Remove" onClick={() => onChange(list.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onChange([...list, ""])}>Add</button>
          {help}
        </div>
      );
    }
    case "object":
      return (
        <fieldset className="admin-group mb-3">
          <legend>{field.label}</legend>
          <FieldEditor fields={field.fields} value={(value as Value) ?? {}} onChange={onChange} />
        </fieldset>
      );
    case "list": {
      const list = (value as Value[]) ?? [];
      const full = field.max !== undefined && list.length >= field.max;
      return (
        <div className="mb-3">
          <div className="form-label">{field.label}</div>
          {list.map((item, i) => (
            <details key={i} className="admin-item">
              <summary>
                <span>{String(item[field.summary] || `Item ${i + 1}`)}</span>
                <span className="btn-group btn-group-sm" onClick={(e) => e.preventDefault()}>
                  <button type="button" className="btn btn-outline-secondary" aria-label="Move up" onClick={() => onChange(move(list, i, i - 1))} disabled={i === 0}>↑</button>
                  <button type="button" className="btn btn-outline-secondary" aria-label="Move down" onClick={() => onChange(move(list, i, i + 1))} disabled={i === list.length - 1}>↓</button>
                  <button type="button" className="btn btn-outline-danger" aria-label="Remove" onClick={() => onChange(list.filter((_, j) => j !== i))}>✕</button>
                </span>
              </summary>
              <div className="admin-item__body">
                <FieldEditor fields={field.fields} value={item} onChange={(v) => onChange(list.map((x, j) => (j === i ? v : x)))} />
              </div>
            </details>
          ))}
          {!full && (
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onChange([...list, blank(field.fields)])}>Add</button>
          )}
          {field.max !== undefined && <div className="form-text">Up to {field.max}.</div>}
        </div>
      );
    }
  }
}

export default function FieldEditor({ fields, value, onChange }: { fields: Field[]; value: Value; onChange: (v: Value) => void }) {
  return (
    <>
      {fields.map((f) => (
        <FieldInput key={f.name} field={f} value={value[f.name]} onChange={(v) => onChange({ ...value, [f.name]: v })} />
      ))}
    </>
  );
}
