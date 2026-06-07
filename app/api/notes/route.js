import { NextResponse } from "next/server";
import { getNotes, createNote, validateNote } from "@/lib/store";

// Tell every connected client that the note list changed, if the realtime
// server is running. globalThis.io is set in server.js. The optional chaining
// keeps this safe when the app runs without the custom server.
function broadcast() {
  globalThis.io?.emit("notes:changed");
}

// GET /api/notes  ->  return every note
export async function GET() {
  return NextResponse.json({ success: true, notes: getNotes() }, { status: 200 });
}

// POST /api/notes  ->  create a note
export async function POST(request) {
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

  const note = createNote(body);
  broadcast();

  return NextResponse.json(
    { success: true, message: "Note created successfully", note },
    { status: 201 }
  );
}
