"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSocket } from "@/lib/socket";
import { CATEGORIES, categoryColor } from "@/lib/format";

const TITLE_MIN = 3;
const TITLE_MAX = 100;
const CONTENT_MIN = 10;

export default function NoteForm({ mode = "create", noteId, initialNote }) {
  const router = useRouter();
  const { startEditing, stopEditing } = useSocket();

  const [title, setTitle] = useState(initialNote?.title || "");
  const [content, setContent] = useState(initialNote?.content || "");
  const [category, setCategory] = useState(initialNote?.category || "General");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  // Let other clients know this note is being edited.
  useEffect(() => {
    if (mode === "edit" && noteId) {
      startEditing(noteId);
      return () => stopEditing(noteId);
    }
  }, [mode, noteId, startEditing, stopEditing]);

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();

  const titleError =
    trimmedTitle.length === 0
      ? "Title is required"
      : trimmedTitle.length < TITLE_MIN
        ? `At least ${TITLE_MIN} characters`
        : trimmedTitle.length > TITLE_MAX
          ? `At most ${TITLE_MAX} characters`
          : null;

  const contentError =
    trimmedContent.length === 0
      ? "Content is required"
      : trimmedContent.length < CONTENT_MIN
        ? `At least ${CONTENT_MIN} characters`
        : null;

  const valid = !titleError && !contentError;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!valid || submitting) return;

    setSubmitting(true);
    const url = mode === "edit" ? `/api/notes/${noteId}` : "/api/notes";
    const method = mode === "edit" ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
          category,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        const message = data.errors?.join(". ") || "Something went wrong";
        toast.error(message);
        setSubmitting(false);
        return;
      }

      toast.success(
        mode === "edit" ? "Note updated" : "Note created"
      );
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Network error. Is the server running?");
      setSubmitting(false);
    }
  }

  const showTitleError = touched && titleError;
  const showContentError = touched && contentError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto max-w-2xl"
    >
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
      >
        <ArrowLeft size={15} />
        Back to notes
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {mode === "edit" ? "Edit note" : "New note"}
      </h1>
      <p className="mt-1 text-sm text-[var(--text-dim)]">
        {mode === "edit"
          ? "Changes broadcast live to anyone viewing this note."
          : "Give it a title and a few lines of content."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <span
              className={`text-xs ${
                trimmedTitle.length > TITLE_MAX
                  ? "text-[var(--danger)]"
                  : "text-[var(--text-faint)]"
              }`}
            >
              {trimmedTitle.length}/{TITLE_MAX}
            </span>
          </div>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="A short, clear title"
            className="focus-ring w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-faint)] transition-colors"
          />
          {showTitleError && (
            <p className="mt-1.5 text-xs text-[var(--danger)]">{titleError}</p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <span className="text-xs text-[var(--text-faint)]">
              {trimmedContent.length} characters
            </span>
          </div>
          <textarea
            id="content"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Write whatever you need to remember..."
            className="focus-ring w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 leading-relaxed text-[var(--text)] placeholder:text-[var(--text-faint)] transition-colors"
          />
          {showContentError && (
            <p className="mt-1.5 text-xs text-[var(--danger)]">
              {contentError}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = c === category;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? "border-[var(--border-strong)] bg-[var(--surface-strong)] text-[var(--text)]"
                      : "border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)]"
                  }`}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: categoryColor(c) }}
                  />
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <motion.button
            type="submit"
            disabled={submitting || (touched && !valid)}
            whileHover={{ scale: submitting ? 1 : 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-5 py-3 font-medium text-black shadow-lg shadow-[var(--accent)]/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Check size={17} strokeWidth={2.6} />
            )}
            {mode === "edit" ? "Save changes" : "Create note"}
          </motion.button>
          <Link
            href="/"
            className="rounded-xl px-4 py-3 text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
