"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Pause, Play } from "./icons";

/** The photograph opens like an editorial page. Content is visible without JS. */
export function EditorialReveal({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const section = ref.current;
    if (!section || reduced || !window.IntersectionObserver) return;
    let animations: Animation[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const photo = section.querySelector(
          ".travel-story-photo, .personal-photo",
        );
        const heading = section.querySelector("h2");
        if (photo)
          animations.push(
            photo.animate(
              [
                { clipPath: "inset(0 0 0 100%)", transform: "scale(1.04)" },
                { clipPath: "inset(0 0 0 0)", transform: "scale(1)" },
              ],
              { duration: 780, easing: "cubic-bezier(.16,1,.3,1)" },
            ),
          );
        if (heading)
          animations.push(
            heading.animate(
              [
                { transform: "translateY(18px)", opacity: 0.35 },
                { transform: "translateY(0)", opacity: 1 },
              ],
              { duration: 620, easing: "cubic-bezier(.16,1,.3,1)" },
            ),
          );
        observer.disconnect();
      },
      { threshold: 0.18 },
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, [reduced]);
  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  );
}

export function ScentRibbon() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "80px" });
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
  const stopped = paused || hidden || !inView || !!reduced;
  return (
    <div ref={ref} className="scent-ribbon" data-paused={stopped}>
      <div className="scent-ribbon-track">
        {[0, 1].map((copy) => (
          <div
            className="scent-ribbon-group"
            key={copy}
            aria-hidden={copy === 1}
          >
            <span>Wear your mood.</span>
            <span className="ribbon-divider" aria-hidden="true" />
            <span>Make it yours.</span>
            <span className="ribbon-divider" aria-hidden="true" />
          </div>
        ))}
      </div>
      {!reduced && (
        <button
          className="ribbon-control"
          aria-label={paused ? "Play moving text" : "Pause moving text"}
          onClick={() => setPaused(!paused)}
        >
          {paused ? (
            <Play size={16} weight="fill" />
          ) : (
            <Pause size={16} weight="fill" />
          )}
        </button>
      )}
    </div>
  );
}
