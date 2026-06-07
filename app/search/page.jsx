import { Suspense } from "react";
import SearchResults from "@/components/SearchResults";

export const metadata = { title: "Search · Lumina" };

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <p className="py-20 text-center text-[var(--text-dim)]">Searching...</p>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
