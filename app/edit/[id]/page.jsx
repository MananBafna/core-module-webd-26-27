import { notFound } from "next/navigation";
import NoteForm from "@/components/NoteForm";
import { getNoteById } from "@/lib/store";

export const metadata = { title: "Edit note · Lumina" };

export default async function EditPage({ params }) {
  // params is a Promise in current Next.js.
  const { id } = await params;
  const note = getNoteById(id);

  if (!note) notFound();

  return <NoteForm mode="edit" noteId={id} initialNote={note} />;
}
