// Optional note categories. A note may use one of these or be left as General.
export const CATEGORIES = [
  "General",
  "Product",
  "Research",
  "Draft",
  "Personal",
  "Idea",
];

// A small accent color per category, used for the card label dot.
// Matches the Stitch reference: Product = teal, Research = pink, Draft = violet.
const CATEGORY_COLORS = {
  General: "var(--text-faint)",
  Product: "var(--accent-2)",
  Research: "var(--tertiary)",
  Draft: "var(--accent)",
  Personal: "#ffb86b",
  Idea: "#7aa2ff",
};

export function categoryColor(category) {
  return CATEGORY_COLORS[category] || "var(--accent)";
}

// Turn an ISO timestamp into a short "3m ago" style label.
export function timeAgo(iso) {
  const then = new Date(iso).getTime();
  const seconds = Math.floor((Date.now() - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
