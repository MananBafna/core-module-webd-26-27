"use client";

import dynamic from "next/dynamic";

// The WebGL scene only ever runs in the browser, so it is loaded with
// ssr disabled. While it loads we show the plain dark canvas underneath.
const ThreeScene = dynamic(() => import("./ThreeScene"), { ssr: false });

export default function ThreeBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
      style={{ opacity: "var(--bg-opacity-3d)" }}
    >
      <ThreeScene />
    </div>
  );
}
