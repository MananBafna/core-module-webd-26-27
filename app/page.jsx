"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Zap, Users, ArrowRight } from "lucide-react";
import NoteCard from "@/components/NoteCard";
import { useSocket } from "@/lib/socket";

export default function HomePage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      if (data.success) setNotes(data.notes);
    } catch {
      toast.error("Could not load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  const { online, editingIds } = useSocket(fetchNotes);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  async function handleDelete(note) {
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
    try {
      const res = await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Note deleted");
    } catch {
      toast.error("Delete failed");
      fetchNotes();
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="py-12 text-center sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 label-meta text-[var(--text-dim)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-2)] opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent-2)]" />
          </span>
          Real-time sync enabled
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
        >
          Capture ideas in <span className="text-gradient">Lumina</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mx-auto mt-5 max-w-xl text-pretty text-lg text-[var(--text-dim)]"
        >
          Experience a fluid, glass-inspired workspace designed for thinkers.
          Sync your thoughts instantly across every tab with luminous precision.
          {online > 1 && <> {online} people are connected right now.</>}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <Link href="/create">
            <motion.span
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl cta-gradient px-6 py-3 font-medium shadow-xl shadow-[var(--accent)]/25"
            >
              <Plus size={18} strokeWidth={2.6} />
              Create your first note
            </motion.span>
          </Link>
        </motion.div>
      </section>

      {/* Notes grid */}
      <section className="scroll-mt-24">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Recent notes</h2>
          <span className="text-sm text-[var(--text-faint)]">
            {loading ? "Loading" : `${notes.length} total`}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
              />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={handleDelete}
                  isBeingEdited={editingIds.has(note.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Feature cards */}
      <section
        id="features"
        className="mt-8 grid grid-cols-1 gap-4 scroll-mt-24 lg:grid-cols-3"
      >
        {/* large card with image background */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4 }}
          className="relative flex min-h-72 flex-col justify-end overflow-hidden rounded-2xl glass p-7 lg:col-span-2"
        >
          <Image
            src="/stitch/galaxy.png"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />
          <div className="relative">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--accent)]/20 text-[var(--accent)]">
              <Users size={20} />
            </span>
            <h3 className="mt-4 text-2xl font-bold">Seamless collaboration</h3>
            <p className="mt-2 max-w-md text-[var(--text-dim)]">
              Work with your team in real time. Lumina tracks every cursor, every
              edit, and every spark of an idea across all tabs.
            </p>
          </div>
        </motion.div>

        {/* small dark card */}
        <FeatureCard
          icon={Zap}
          title="Zero latency"
          body="A socket layer keeps state in sync faster than you can blink, with no page reloads and no polling."
          accent="var(--accent-2)"
        />
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4 }}
      className="relative flex min-h-72 flex-col justify-end overflow-hidden rounded-2xl glass p-7"
    >
      <div
        className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl"
        style={{ background: accent }}
      />
      <span
        className="relative grid h-11 w-11 place-items-center rounded-xl"
        style={{ background: `${accent}22`, color: accent }}
      >
        <Icon size={20} />
      </span>
      <h3 className="relative mt-4 text-2xl font-bold">{title}</h3>
      <p className="relative mt-2 text-[var(--text-dim)]">{body}</p>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl glass py-20 text-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative mb-2 h-52 w-52 overflow-hidden rounded-3xl glass-strong shadow-2xl shadow-[var(--accent)]/20"
      >
        <Image
          src="/stitch/empty-object.png"
          alt="A glowing stylus resting on a glass canvas"
          fill
          sizes="208px"
          className="object-cover"
          priority
        />
      </motion.div>
      <p className="mt-6 text-2xl font-bold">Your light is waiting to be captured</p>
      <p className="mt-2 max-w-sm text-[var(--text-dim)]">
        Start your first note to begin your journey. Turn ideas into luminous
        reality in your new infinite workspace.
      </p>
      <Link href="/create" className="mt-6">
        <motion.span
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 rounded-xl cta-gradient px-5 py-3 font-medium"
        >
          <Plus size={16} strokeWidth={2.6} />
          Create your first note
          <ArrowRight size={16} />
        </motion.span>
      </Link>
    </motion.div>
  );
}
