"use client";

// Quote request form. Until the Cloudflare function exists (NEXT_PUBLIC_CONTACT_ENDPOINT unset),
// submitting explains that and points to the phone and email instead.
import { useState, type FormEvent } from "react";

const ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;

type Status = { kind: "" | "is-sending" | "is-success" | "is-error"; text: string };

export default function ContactForm({ phone, email }: { phone: string; email: string }) {
  const [status, setStatus] = useState<Status>({ kind: "", text: "" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ENDPOINT) {
      setStatus({
        kind: "is-error",
        text: `The form isn't connected yet. Please call ${phone} or email ${email}.`,
      });
      return;
    }
    const form = e.currentTarget;
    setStatus({ kind: "is-sending", text: "Sending…" });
    try {
      const res = await fetch(ENDPOINT, { method: "POST", body: new FormData(form) });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus({ kind: "is-success", text: "Thank you! We'll be in touch soon." });
    } catch {
      setStatus({
        kind: "is-error",
        text: `Sorry, that didn't send. Please call ${phone} or email ${email}.`,
      });
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate={false}>
      <div className="row">
        <div className="col-lg-6 mb-3">
          <label className="visually-hidden" htmlFor="contact-name">
            Name
          </label>
          <input type="text" className="form-control" id="contact-name" name="name" placeholder="Name" autoComplete="name" required />
        </div>
        <div className="col-lg-6 mb-3">
          <label className="visually-hidden" htmlFor="contact-phone">
            Phone
          </label>
          <input type="tel" className="form-control" id="contact-phone" name="phone" placeholder="Phone" autoComplete="tel" />
        </div>
      </div>
      <div className="mb-3">
        <label className="visually-hidden" htmlFor="contact-email">
          Email address
        </label>
        <input type="email" className="form-control" id="contact-email" name="email" placeholder="Email address" autoComplete="email" required />
      </div>
      <div className="mb-3">
        <label className="visually-hidden" htmlFor="contact-message">
          About your project
        </label>
        <textarea
          name="message"
          id="contact-message"
          rows={7}
          className="form-control"
          placeholder="Tell us about your project: what, where and roughly when"
          required
        />
      </div>
      {/* Spam trap: people never see or fill this field */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" hidden />
      <input type="submit" className="btn btn-black" value="Request a quote" />
      <p className={`kit-form-status ${status.kind}`} role="status" aria-live="polite">
        {status.text}
      </p>
    </form>
  );
}
