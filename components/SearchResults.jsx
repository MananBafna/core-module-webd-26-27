"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Pencil, SearchX } from "lucide-react";
import { timeAgo, categoryColor } from "@/lib/format";
import { useSocket } from "@/lib/socket";

// Split text on the query (case-insensitive) and wrap matches in <mark>.
function highlight(text, query) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "ig"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="hl">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function SearchResults() {
  const query = (useSearchParams().get("q") || "").trim();
  const [notes, setNotes] = useState([]);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      if (data.success) setNotes(data.notes);
    } catch {
      toast.error("Could not load notes");
    }
  }, []);

  const { editingIds } = useSocket(fetchNotes);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const matches = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.category || "").toLowerCase().includes(q)
    );
  }, [notes, query]);

  return (
    <div className="py-4">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
      >
        <ArrowLeft size={15} />
        Back to notes
      </Link>

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Search results
      </h1>
      <p className="mt-2 text-[var(--text-dim)]">
        {query ? (
          <>
            {matches.length} {matches.length === 1 ? "match" : "matches"} for{" "}
            <span className="text-[var(--accent)]">&quot;{query}&quot;</span>
          </>
        ) : (
          "Type a query in the search bar above."
        )}
      </p>

      {query && matches.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl glass py-16 text-center">
          <SearchX size={32} className="mb-3 text-[var(--text-faint)]" />
          <p className="text-lg font-medium">No notes matched that search</p>
          <p className="mt-1 text-sm text-[var(--text-dim)]">
            Try a different word or check your spelling.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Link
                href={`/edit/${note.id}`}
                className="group flex h-full flex-col rounded-2xl glass p-5 transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="mb-2 flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: categoryColor(note.category) }}
                  />
                  <span
                    className="label-meta"
                    style={{ color: categoryColor(note.category) }}
                  >
                    {note.category || "General"}
                  </span>
                </div>
                <h3 className="line-clamp-2 text-lg font-semibold leading-snug">
                  {highlight(note.title, query)}
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--text-dim)]">
                  {highlight(note.content, query)}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs">
                  <span className="text-[var(--text-faint)]">
                    Updated {timeAgo(note.createdAt)}
                  </span>
                  {editingIds.has(note.id) && (
                    <span className="flex items-center gap-1 text-[var(--accent-2)]">
                      <Pencil size={11} className="animate-pulse" />
                      Active now
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
