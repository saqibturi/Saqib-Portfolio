"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
export function Motion() {
  const path = usePathname();
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!reduced.matches) {
              const index = Array.from(
                entry.target.parentElement?.children || [],
              ).indexOf(entry.target);
              animations.push(
                entry.target.animate(
                  [
                    { opacity: 0, transform: "translateY(30px)" },
                    { opacity: 1, transform: "translateY(0)" },
                  ],
                  {
                    duration: 700,
                    delay: Math.min(index * 65, 200),
                    easing: "cubic-bezier(.16,1,.3,1)",
                    fill: "both",
                  },
                ),
              );
            }
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((el) => observer.observe(el));
    let ticking = false;
    const scroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const height = document.documentElement.scrollHeight - innerHeight;
        document.documentElement.style.setProperty(
          "--scroll-progress",
          `${height > 0 ? scrollY / height : 0}`,
        );
        ticking = false;
      });
    };
    const stop = () => {
      if (reduced.matches) animations.forEach((a) => a.finish());
    };
    window.addEventListener("scroll", scroll, { passive: true });
    reduced.addEventListener("change", stop);
    scroll();
    return () => {
      observer.disconnect();
      animations.forEach((a) => a.cancel());
      window.removeEventListener("scroll", scroll);
      reduced.removeEventListener("change", stop);
    };
  }, [path]);
  return <div className="reading-progress" aria-hidden="true" />;
}
