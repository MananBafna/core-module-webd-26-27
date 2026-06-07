// In-memory notes store.
//
// There is no database in this module. Notes live in a plain JavaScript array
// that resets whenever the server restarts. The array is parked on globalThis
// so it survives Next.js hot reloads in development and so the API routes and
// the Socket.io server (which run in the same Node process) share one source
// of truth instead of each getting their own copy.

const MAX_CATEGORY = 30;

// Coerce any incoming category into a clean string, defaulting to General.
function normalizeCategory(category) {
  if (typeof category !== "string") return "General";
  const trimmed = category.trim();
  return trimmed.length === 0 ? "General" : trimmed.slice(0, MAX_CATEGORY);
}

function getStore() {
  if (!globalThis.__notesStore) {
    // Start empty: a fresh server has no notes until the user creates one.
    globalThis.__notesStore = [];
  }
  return globalThis.__notesStore;
}

export function getNotes() {
  // Newest first.
  return [...getStore()].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export function getNoteById(id) {
  return getStore().find((note) => note.id === id) || null;
}

export function createNote({ title, content, category }) {
  const note = {
    id: Date.now().toString(),
    title: title.trim(),
    content: content.trim(),
    category: normalizeCategory(category),
    createdAt: new Date().toISOString(),
  };
  getStore().push(note);
  return note;
}

export function updateNote(id, { title, content, category }) {
  const note = getNoteById(id);
  if (!note) return null;
  note.title = title.trim();
  note.content = content.trim();
  note.category = normalizeCategory(category);
  return note;
}

export function deleteNote(id) {
  const store = getStore();
  const index = store.findIndex((note) => note.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}

// Backend validation. Returns an array of human readable error strings.
// An empty array means the payload is valid.
export function validateNote({ title, content, category }) {
  const errors = [];

  const cleanTitle = typeof title === "string" ? title.trim() : "";
  const cleanContent = typeof content === "string" ? content.trim() : "";

  // Category is optional, but if sent it must be a short string.
  if (category !== undefined && category !== null) {
    if (typeof category !== "string") {
      errors.push("Category must be a string");
    } else if (category.trim().length > MAX_CATEGORY) {
      errors.push(`Category must not exceed ${MAX_CATEGORY} characters`);
    }
  }

  if (cleanTitle.length === 0) {
    errors.push("Title is required");
  } else if (cleanTitle.length < 3) {
    errors.push("Title must be at least 3 characters long");
  } else if (cleanTitle.length > 100) {
    errors.push("Title must not exceed 100 characters");
  }

  if (cleanContent.length === 0) {
    errors.push("Content is required");
  } else if (cleanContent.length < 10) {
    errors.push("Content must be at least 10 characters long");
  }

  return errors;
}
