// Custom server: runs Next.js and Socket.io on the same HTTP server and port.
//
// This keeps the project a single unified app on http://localhost:3000 while
// adding a realtime channel on top of the normal Next.js request handling.
// `npm run dev` and `npm start` both boot through this file.

const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));

  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  // Expose io to the API route handlers so a REST write can fan out a
  // realtime update to every connected client.
  globalThis.io = io;

  // Track who is currently editing which note, so we can hand the live
  // state to a client the moment it connects.
  const editing = new Map(); // noteId -> Set of socket ids

  function presenceCount() {
    return io.engine.clientsCount;
  }

  io.on("connection", (socket) => {
    io.emit("presence", { online: presenceCount() });

    // Send the current editing state to the freshly connected client.
    for (const [noteId, sockets] of editing) {
      if (sockets.size > 0) socket.emit("note:editing", { noteId, active: true });
    }

    socket.on("note:editing", ({ noteId }) => {
      if (!editing.has(noteId)) editing.set(noteId, new Set());
      editing.get(noteId).add(socket.id);
      socket.broadcast.emit("note:editing", { noteId, active: true });
    });

    socket.on("note:stopEditing", ({ noteId }) => {
      const sockets = editing.get(noteId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          editing.delete(noteId);
          io.emit("note:editing", { noteId, active: false });
        }
      }
    });

    socket.on("disconnect", () => {
      // Clear any editing flags this socket held.
      for (const [noteId, sockets] of editing) {
        if (sockets.delete(socket.id) && sockets.size === 0) {
          editing.delete(noteId);
          io.emit("note:editing", { noteId, active: false });
        }
      }
      io.emit("presence", { online: presenceCount() });
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Lumina ready on http://${hostname}:${port}`);
  });
});
