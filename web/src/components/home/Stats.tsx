"use client";

// The template's Skills section: SVG rings that fill to a percentage, with the number counting
// up, when scrolled into view (was main.js initProgressCircles + kit/counters.js).
import { useEffect, useRef, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import type { HomeContent } from "@/lib/content";

const SIZE = 150;
const THICKNESS = 4;
const RADIUS = (SIZE - THICKNESS) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DURATION_MS = 2000;

function Ring({ label, percent }: { label: string; percent: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [value, setValue] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const start = () => {
      if (reduce) {
        setAnimate(false);
        setShown(true);
        setValue(percent);
        return;
      }
      // Next frame so the empty ring paints before the transition starts.
      frame = requestAnimationFrame(() => {
        setShown(true);
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / DURATION_MS);
          setValue(Math.round(percent * (1 - Math.pow(1 - p, 3)))); // ease-out
          if (p < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      });
    };
    if (!("IntersectionObserver" in window)) {
      start();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [percent]);

  const offset = shown ? CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE : CIRCUMFERENCE;

  return (
    <div className="progressbar" ref={ref}>
      <div className="circle" data-percent={percent}>
        <svg width={SIZE} height={SIZE} aria-hidden="true" focusable="false">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#eee" strokeWidth={THICKNESS} />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#ff2e63"
            strokeWidth={THICKNESS}
            strokeLinecap="round"
            style={{
              strokeDasharray: CIRCUMFERENCE,
              strokeDashoffset: offset,
              transition: animate ? `stroke-dashoffset ${DURATION_MS}ms ease-out` : "none",
            }}
          />
        </svg>
        <div className="number">
          <span>{value}</span>%
        </div>
        <p className="caption">{label}</p>
      </div>
    </div>
  );
}

export default function Stats({ stats }: { stats: HomeContent["stats"] }) {
  return (
    <div className="untree_co-section pb-0">
      <div className="container">
        <SectionHeading title={stats.heading} intro={stats.intro} />
        <div className="row">
          {stats.items.map((item) => (
            <div key={item.label} className="col-6 col-lg-3 text-center" data-reveal="fade-up">
              <Ring label={item.label} percent={Math.max(0, Math.min(100, item.percent))} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
