"use client";

// Quote request form (the template's contact form). Until the Cloudflare function exists
// (NEXT_PUBLIC_CONTACT_ENDPOINT unset), submitting explains that and gives the phone and email.
import { FormStatusLine, useKitForm } from "@/components/useKitForm";

export default function ContactForm({ phone, email }: { phone: string; email: string }) {
  const fallback = `Please call ${phone} or email ${email}.`;
  const { status, sending, formProps } = useKitForm({
    endpoint: process.env.NEXT_PUBLIC_CONTACT_ENDPOINT,
    success: "Thank you! We'll be in touch soon.",
    error: `Sorry, that didn't send. ${fallback}`,
    notConnected: `The form isn't connected yet. ${fallback}`,
  });

  return (
    <form {...formProps}>
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
      <input type="submit" className="btn btn-black" value="Request a quote" disabled={sending} aria-busy={sending || undefined} />
      <FormStatusLine status={status} />
    </form>
  );
}
