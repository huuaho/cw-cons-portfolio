"use client";

// Autoplay shared by the sliders, matching the template: every `interval` ms, paused while
// hovered or focused, while the tab is hidden, and never with reduced motion.
import { useEffect, useRef, useState } from "react";

export function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduce;
}

export function useAutoplay(advance: () => void, interval: number, enabled: boolean) {
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reduce = useReducedMotion();
  const advanceRef = useRef(advance);
  useEffect(() => {
    advanceRef.current = advance;
  });

  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const running = enabled && !paused && !hidden && !reduce;
  const [tick, setTick] = useState(0); // restarts the timer after a manual move
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => advanceRef.current(), interval);
    return () => window.clearInterval(id);
  }, [running, interval, tick]);

  return {
    restart: () => setTick((t) => t + 1),
    handlers: {
      onMouseEnter: () => setPaused(true),
      onMouseLeave: () => setPaused(false),
      onFocus: () => setPaused(true),
      onBlur: (e: React.FocusEvent<HTMLElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      },
    },
    reduce,
  };
}

/** Horizontal swipe: calls `onSwipe(+1)` for left, `-1` for right, past 50 px. */
export function swipeHandlers(onSwipe: (step: 1 | -1) => void) {
  let startX = 0;
  return {
    onTouchStart: (e: React.TouchEvent) => {
      startX = e.changedTouches[0].screenX;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const diff = startX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) onSwipe(diff > 0 ? 1 : -1);
    },
  };
}
