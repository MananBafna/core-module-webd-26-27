"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// One shared socket connection for the whole browser tab.
let socket = null;

function getSocket() {
  if (!socket) {
    socket = io({ transports: ["websocket", "polling"] });
  }
  return socket;
}

// Realtime hook.
//   onNotesChanged: called whenever any client creates / edits / deletes a note,
//                   so the caller can refetch the list.
// Returns the live online count, the set of note ids someone is editing, and
// helpers to announce that this client is editing a note.
export function useSocket(onNotesChanged) {
  const [online, setOnline] = useState(1);
  const [editingIds, setEditingIds] = useState(() => new Set());
  const changedRef = useRef(onNotesChanged);
  changedRef.current = onNotesChanged;

  useEffect(() => {
    const s = getSocket();

    const handleChanged = () => changedRef.current && changedRef.current();
    const handlePresence = ({ online }) => setOnline(online);
    const handleEditing = ({ noteId, active }) => {
      setEditingIds((prev) => {
        const next = new Set(prev);
        if (active) next.add(noteId);
        else next.delete(noteId);
        return next;
      });
    };

    s.on("notes:changed", handleChanged);
    s.on("presence", handlePresence);
    s.on("note:editing", handleEditing);

    return () => {
      s.off("notes:changed", handleChanged);
      s.off("presence", handlePresence);
      s.off("note:editing", handleEditing);
    };
  }, []);

  const startEditing = (noteId) => getSocket().emit("note:editing", { noteId });
  const stopEditing = (noteId) =>
    getSocket().emit("note:stopEditing", { noteId });

  return { online, editingIds, startEditing, stopEditing };
}
