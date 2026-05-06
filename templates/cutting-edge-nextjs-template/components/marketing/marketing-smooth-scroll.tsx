"use client";

import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

type MarketingSmoothScrollProps = {
  children: ReactNode;
};

export default function MarketingSmoothScroll({ children }: MarketingSmoothScrollProps) {
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const smootherRef = useRef<ReturnType<typeof ScrollSmoother.create> | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!wrapperRef.current || !contentRef.current) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      smootherRef.current?.kill();

      smootherRef.current = ScrollSmoother.create({
        wrapper: wrapperRef.current!,
        content: contentRef.current!,
        smooth: 1,
        effects: true,
        normalizeScroll: false,
      });

      ScrollTrigger.refresh();
    }, wrapperRef);

    return () => {
      smootherRef.current?.kill();
      smootherRef.current = null;
      ctx.revert();
    };
  }, [pathname]);

  return (
    <div id="marketing-smooth-wrapper" ref={wrapperRef}>
      <div id="marketing-smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
