"use client";

// The template's sample form: visible labels, help text, select and checkbox. Not connected.
import { FormStatusLine, useKitForm } from "@/components/useKitForm";

export default function SampleForm() {
  const { status, sending, formProps } = useKitForm({
    endpoint: undefined,
    success: "Thank you! Your message has been sent.",
    error: "Sorry, that didn't send.",
    notConnected: "This is a sample form; it doesn't send anything.",
  });
  return (
    <form {...formProps} className={["contact-form", formProps.className].filter(Boolean).join(" ")}>
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label" htmlFor="el-fname">
              First name
            </label>
            <input type="text" className="form-control" id="el-fname" name="fname" autoComplete="given-name" required />
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label" htmlFor="el-lname">
              Last name
            </label>
            <input type="text" className="form-control" id="el-lname" name="lname" autoComplete="family-name" />
          </div>
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor="el-email">
          Email address
        </label>
        <input type="email" className="form-control" id="el-email" name="email" aria-describedby="el-email-help" autoComplete="email" required />
        <div id="el-email-help" className="form-text">
          We&apos;ll never share your email with anyone else.
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor="el-message">
          Message
        </label>
        <textarea name="message" className="form-control" id="el-message" rows={5} required />
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor="el-select">
          Type of project
        </label>
        <select id="el-select" className="form-select" name="type" defaultValue="renovation">
          <option value="renovation">Renovation</option>
          <option value="addition">Addition</option>
          <option value="other">Something else</option>
        </select>
      </div>
      <div className="mb-3 form-check">
        <input type="checkbox" className="form-check-input" id="el-check" defaultChecked />
        <label className="form-check-label" htmlFor="el-check">
          Keep me updated
        </label>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" hidden />
      <button type="submit" className="btn btn-primary" disabled={sending}>
        Submit
      </button>
      <FormStatusLine status={status} />
    </form>
  );
}
