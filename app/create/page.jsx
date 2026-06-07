import NoteForm from "@/components/NoteForm";

export const metadata = { title: "New note · Lumina" };

export default function CreatePage() {
  return <NoteForm mode="create" />;
}
