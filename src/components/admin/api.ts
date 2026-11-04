// Calls to the Worker's editor API. The custom header marks requests as coming from the editor
// page (the Worker refuses writes without it, which blocks simple cross-site form posts).
export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/admin/${path}`, {
    ...init,
    headers: {
      "x-requested-with": "admin",
      ...(init.body && !(init.body instanceof FormData) ? { "content-type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `Something went wrong (${res.status}).`);
  return data;
}

export async function uploadPhoto(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const { url } = await api<{ url: string }>("media", { method: "POST", body });
  return url;
}
