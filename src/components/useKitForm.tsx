"use client";

// The template's kit/form.js behaviour as a hook: own validation messages (invalid fields get
// .is-invalid and aria-invalid, the first is focused), busy state while sending, 15 s timeout,
// and a handler that answers "OK" for success or a short sentence for an error.
import { useState, type FormEvent } from "react";

const TIMEOUT_MS = 15000;
type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
export type FormStatus = { kind: "" | "is-sending" | "is-success" | "is-error"; text: string };

function markFields(form: HTMLFormElement): Field | null {
  let first: Field | null = null;
  Array.from(form.elements).forEach((el) => {
    const field = el as Field;
    if (!field.willValidate) return;
    const bad = !field.checkValidity();
    if (bad) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
    field.classList.toggle("is-invalid", bad);
    if (bad && !first) first = field;
  });
  return first;
}

export function useKitForm({
  endpoint,
  success,
  error,
  notConnected,
}: {
  endpoint: string | undefined;
  success: string;
  error: string;
  notConnected: string;
}) {
  const [status, setStatus] = useState<FormStatus>({ kind: "", text: "" });
  const [validated, setValidated] = useState(false);
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setValidated(true);
    const invalid = markFields(form);
    if (invalid) {
      setStatus({ kind: "is-error", text: invalid.validationMessage || "Please check the highlighted fields." });
      invalid.focus();
      return;
    }
    if (!endpoint) {
      setStatus({ kind: "is-error", text: notConnected });
      return;
    }

    setSending(true);
    setStatus({ kind: "is-sending", text: "Sending…" });
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { "X-Requested-With": "fetch", Accept: "text/plain" },
        signal: controller.signal,
      });
      const text = (await res.text()).trim();
      if (res.ok && text === "OK") {
        form.reset();
        setValidated(false);
        Array.from(form.elements).forEach((el) => {
          el.removeAttribute("aria-invalid");
          el.classList.remove("is-invalid");
        });
        setStatus({ kind: "is-success", text: success });
      } else {
        // Only show a short plain-text sentence from the handler, never a host's error page.
        const msg = res.ok && text && text.length < 300 && !/<[a-z!?]/i.test(text) ? text : error;
        setStatus({ kind: "is-error", text: msg });
      }
    } catch {
      setStatus({ kind: "is-error", text: error });
    } finally {
      window.clearTimeout(timer);
      setSending(false);
    }
  }

  return {
    status,
    sending,
    formProps: {
      onSubmit,
      noValidate: true,
      className: validated ? "was-validated" : undefined,
      "aria-busy": sending || undefined,
      // Clear a field's error as soon as it becomes valid.
      onInput: (e: FormEvent<HTMLFormElement>) => {
        const el = e.target as Field;
        if (el.classList.contains("is-invalid") && el.checkValidity()) {
          el.classList.remove("is-invalid");
          el.removeAttribute("aria-invalid");
        }
      },
    },
  };
}

export function FormStatusLine({ status }: { status: FormStatus }) {
  return (
    <p className={`kit-form-status ${status.kind}`} role="status" aria-live="polite" hidden={!status.text}>
      {status.text}
    </p>
  );
}
