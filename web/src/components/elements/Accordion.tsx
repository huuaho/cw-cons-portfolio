"use client";

// Bootstrap accordion (one panel open at a time, as data-bs-parent did), without Bootstrap JS.
import { useId, useState } from "react";

export default function Accordion({ items }: { items: { title: string; body: string }[] }) {
  const [open, setOpen] = useState(0);
  const id = useId();
  return (
    <div className="accordion custom-accordion">
      {items.map((item, i) => {
        const shown = open === i;
        return (
          <div key={item.title} className="accordion-item">
            <h2 className="accordion-header">
              <button
                className={`accordion-button${shown ? "" : " collapsed"}`}
                type="button"
                aria-expanded={shown}
                aria-controls={`${id}-${i}`}
                onClick={() => setOpen(shown ? -1 : i)}
              >
                {item.title}
              </button>
            </h2>
            <div id={`${id}-${i}`} className={`accordion-collapse collapse${shown ? " show" : ""}`}>
              <div className="accordion-body">{item.body}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
