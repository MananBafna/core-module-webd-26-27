"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, NotebookPen, Search } from "lucide-react";
import { useSocket } from "@/lib/socket";
import { useSettings } from "@/app/providers";

export default function Navbar() {
  const { online } = useSocket();
  const { openSettings } = useSettings();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  function submitSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (q.length === 0) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const onHome = pathname === "/";

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/40 backdrop-blur-2xl">
      <nav className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-3.5 sm:gap-4 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl cta-gradient shadow-lg shadow-[var(--accent)]/20">
            <NotebookPen size={18} strokeWidth={2.4} />
          </span>
          <span className="hidden text-lg font-semibold tracking-tight sm:block">
            Lumina<span className="text-[var(--text-dim)]"> Notes</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              onHome
                ? "text-[var(--text)]"
                : "text-[var(--text-dim)] hover:text-[var(--text)]"
            }`}
          >
            Notes
          </Link>
          <Link
            href="/#features"
            className="rounded-lg px-3 py-1.5 text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
          >
            Features
          </Link>
          <button
            onClick={() => toast("Sharing is on the roadmap")}
            className="rounded-lg px-3 py-1.5 text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
          >
            Shared
          </button>
        </div>

        {/* search */}
        <form
          onSubmit={submitSearch}
          className="relative ml-auto w-full min-w-0 max-w-xs"
        >
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            className="focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)]"
          />
        </form>

        <div className="flex shrink-0 items-center gap-2.5">
          <div
            className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text-dim)] lg:flex"
            title="People connected right now"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-2)] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent-2)]" />
            </span>
            {online} online
          </div>

          <Link href="/create">
            <motion.span
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 rounded-xl cta-gradient px-3.5 py-2 text-sm font-medium shadow-lg shadow-[var(--accent)]/20"
            >
              <Plus size={16} strokeWidth={2.6} />
              <span className="hidden sm:block">New note</span>
            </motion.span>
          </Link>

          <button
            onClick={openSettings}
            title="Settings"
            className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[var(--border-strong)] transition-transform hover:scale-105"
          >
            <Image
              src="/stitch/avatar.png"
              alt="Open settings"
              fill
              sizes="36px"
              className="object-cover"
            />
          </button>
        </div>
      </nav>
    </header>
  );
}
