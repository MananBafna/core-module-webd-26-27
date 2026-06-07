"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  X,
  User,
  Palette,
  RefreshCw,
  Bell,
  LogOut,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { useSettings, useTheme } from "@/app/providers";
import { useSocket } from "@/lib/socket";

const NAV = [
  { key: "profile", label: "Profile", icon: User },
  { key: "appearance", label: "Appearance", icon: Palette },
  { key: "sync", label: "Sync & Cloud", icon: RefreshCw },
  { key: "notifications", label: "Notifications", icon: Bell },
];

const THEMES = [
  { key: "dark", label: "Dark", icon: Moon },
  { key: "light", label: "Light", icon: Sun },
  { key: "system", label: "System", icon: Monitor },
];

export default function SettingsModal() {
  const { settingsOpen, closeSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  const { online } = useSocket();
  const [tab, setTab] = useState("profile");
  const [notify, setNotify] = useState(true);

  // Close on Escape.
  useEffect(() => {
    if (!settingsOpen) return;
    const onKey = (e) => e.key === "Escape" && closeSettings();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen, closeSettings]);

  return (
    <AnimatePresence>
      {settingsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSettings}
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl glass-strong shadow-2xl shadow-[var(--accent)]/10 sm:flex-row"
            style={{ minHeight: "26rem" }}
          >
            {/* left nav */}
            <aside className="flex shrink-0 flex-col border-b border-[var(--border)] p-5 sm:w-56 sm:border-b-0 sm:border-r">
              <div className="mb-6 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg cta-gradient">
                  <Palette size={16} />
                </span>
                <h2 className="text-lg font-semibold">Settings</h2>
              </div>
              <nav className="flex gap-1 sm:flex-col">
                {NAV.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                      tab === key
                        ? "bg-[var(--accent)] font-medium text-[#3c0091]"
                        : "text-[var(--text-dim)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:block">{label}</span>
                  </button>
                ))}
              </nav>
              <button
                onClick={() => {
                  toast.success("Signed out (demo)");
                  closeSettings();
                }}
                className="mt-auto hidden items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[var(--danger)] transition-colors hover:bg-[var(--danger)]/10 sm:flex"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </aside>

            {/* right panel */}
            <section className="relative flex-1 p-6">
              <button
                onClick={closeSettings}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-[var(--text-dim)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]"
                aria-label="Close settings"
              >
                <X size={18} />
              </button>

              {tab === "profile" && (
                <Panel title="Account Profile">
                  <div className="flex items-center gap-4">
                    <span className="relative h-16 w-16 overflow-hidden rounded-full border border-[var(--border-strong)]">
                      <Image
                        src="/stitch/avatar.png"
                        alt="Profile avatar"
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </span>
                    <div>
                      <p className="text-lg font-semibold">Manan Bafna</p>
                      <p className="text-sm text-[var(--text-dim)]">
                        mananbafna2903@gmail.com
                      </p>
                      <span className="mt-1.5 inline-block rounded-md border border-[var(--accent-2)]/40 bg-[var(--accent-2)]/15 px-2 py-0.5 label-meta text-[var(--accent-2)]">
                        Pro plan
                      </span>
                    </div>
                  </div>
                  <ThemeSwitch theme={theme} setTheme={setTheme} />
                </Panel>
              )}

              {tab === "appearance" && (
                <Panel title="Appearance">
                  <p className="text-sm text-[var(--text-dim)]">
                    Choose how Lumina looks. System follows your device setting.
                  </p>
                  <ThemeSwitch theme={theme} setTheme={setTheme} />
                </Panel>
              )}

              {tab === "sync" && (
                <Panel title="Sync & Cloud">
                  <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div>
                      <p className="font-medium">Realtime sync</p>
                      <p className="text-sm text-[var(--text-dim)]">
                        Live over Socket.io
                      </p>
                    </div>
                    <span className="flex items-center gap-2 text-sm text-[var(--accent-2)]">
                      <span className="h-2 w-2 rounded-full bg-[var(--accent-2)]" />
                      Connected
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[var(--text-dim)]">
                    {online} {online === 1 ? "client" : "clients"} connected right now.
                  </p>
                </Panel>
              )}

              {tab === "notifications" && (
                <Panel title="Notifications">
                  <Toggle
                    label="Toast on note changes"
                    desc="Show a toast when notes are created or edited"
                    on={notify}
                    onChange={() => setNotify((v) => !v)}
                  />
                </Panel>
              )}
            </section>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Panel({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold">{title}</h3>
      {children}
    </motion.div>
  );
}

function ThemeSwitch({ theme, setTheme }) {
  return (
    <div>
      <p className="mb-3 label-meta text-[var(--text-faint)]">Appearance</p>
      <div className="grid grid-cols-3 gap-3">
        {THEMES.map(({ key, label, icon: Icon }) => {
          const active = theme === key;
          return (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
                active
                  ? "border-[var(--accent)] bg-[var(--surface-strong)]"
                  : "border-[var(--border)] hover:border-[var(--border-strong)]"
              }`}
            >
              <Icon
                size={20}
                className={active ? "text-[var(--accent)]" : "text-[var(--text-dim)]"}
              />
              <span className="text-sm">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({ label, desc, on, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-[var(--text-dim)]">{desc}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          on ? "bg-[var(--accent)]" : "bg-[var(--surface-strong)]"
        }`}
        role="switch"
        aria-checked={on}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
