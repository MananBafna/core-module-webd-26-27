"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Pencil, Trash2, Pencil as PencilLive } from "lucide-react";
import { timeAgo, categoryColor } from "@/lib/format";

export default function NoteCard({ note, onDelete, isBeingEdited }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl glass p-5 transition-colors hover:border-[var(--border-strong)]"
    >
      {/* glow that fades in on hover */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--accent)]/12 to-transparent" />
      </div>

      {note.category && (
        <div className="relative mb-2 flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: categoryColor(note.category) }}
          />
          <span
            className="label-meta"
            style={{ color: categoryColor(note.category) }}
          >
            {note.category}
          </span>
        </div>
      )}

      <div className="relative flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-[var(--text)]">
          {note.title}
        </h3>
        {isBeingEdited && (
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
            <PencilLive size={10} className="animate-pulse" />
            editing
          </span>
        )}
      </div>

      <p className="relative mt-2 line-clamp-4 flex-1 text-sm leading-relaxed text-[var(--text-dim)]">
        {note.content}
      </p>

      <div className="relative mt-5 flex items-center justify-between border-t border-[var(--border)] pt-3">
        <span className="text-xs text-[var(--text-faint)]">
          {timeAgo(note.createdAt)}
        </span>
        <div className="flex items-center gap-1.5">
          <Link
            href={`/edit/${note.id}`}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-dim)] transition-colors hover:bg-[var(--surface-strong)] hover:text-[var(--text)]"
          >
            <Pencil size={13} />
            Edit
          </Link>
          <button
            onClick={() => onDelete(note)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-dim)] transition-colors hover:bg-[var(--danger)]/15 hover:text-[var(--danger)]"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </div>
    </motion.article>
  );
}
