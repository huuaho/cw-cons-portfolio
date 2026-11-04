// Text helpers with no file access, so client components can use them too.

/** Splits plain text from a textarea into paragraphs on blank lines. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** tel: link from a display phone number. */
export function telHref(phone: string): string {
  return "tel:" + phone.replace(/[^\d+]/g, "");
}
