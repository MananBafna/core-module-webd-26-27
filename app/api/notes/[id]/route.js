import { NextResponse } from "next/server";
import { getNoteById, updateNote, deleteNote, validateNote } from "@/lib/store";

function broadcast() {
  globalThis.io?.emit("notes:changed");
}

// PUT /api/notes/[id]  ->  update an existing note
export async function PUT(request, { params }) {
  // In current Next.js, params is a Promise and must be awaited.
  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, errors: ["Request body must be valid JSON"] },
      { status: 400 }
    );
  }

  const errors = validateNote(body);
  if (errors.length > 0) {
    return NextResponse.json({ success: false, errors }, { status: 400 });
  }

  const note = updateNote(id, body);
  if (!note) {
    return NextResponse.json(
      { success: false, errors: ["Note not found"] },
      { status: 404 }
    );
  }

  broadcast();

  return NextResponse.json(
    { success: true, message: "Note updated successfully", note },
    { status: 200 }
  );
}

// DELETE /api/notes/[id]  ->  remove a note
export async function DELETE(request, { params }) {
  const { id } = await params;

  if (!getNoteById(id)) {
    return NextResponse.json(
      { success: false, errors: ["Note not found"] },
      { status: 404 }
    );
  }

  deleteNote(id);
  broadcast();

  return NextResponse.json(
    { success: true, message: "Note deleted successfully" },
    { status: 200 }
  );
}
