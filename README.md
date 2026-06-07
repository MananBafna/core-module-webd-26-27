# Lumina Notes

A full-stack, real-time notes app built with Next.js. It covers full CRUD over
Next.js API routes with an in-memory store, and adds a Socket.io realtime layer
and a Three.js animated background on top.

## Features

- Create, read, update and delete notes through Next.js API routes
- In-memory store on the server (no database, resets on restart)
- Backend validation with correct status codes (200, 201, 400, 404)
- Real-time sync with Socket.io: a change in one tab updates every other tab
- Live presence: an online count and a per-note "editing" badge
- Three.js (WebGL) animated glass-card background with pointer parallax
- Framer Motion animations, light/dark theme, search, and optional categories
- Fully styled with Tailwind CSS

## Tech stack

Next.js (App Router) · React · Tailwind CSS · Framer Motion ·
Three.js (@react-three/fiber, drei) · Socket.io · sonner

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. A custom server runs Next.js and Socket.io on the
same port, so there is no second server to start. Open two tabs to see the
realtime sync.

## API

All routes live under `/api/notes`.

| Method | Route | Purpose | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/api/notes` | list all notes | 200 | |
| POST | `/api/notes` | create a note | 201 | 400 |
| PUT | `/api/notes/[id]` | update a note | 200 | 400, 404 |
| DELETE | `/api/notes/[id]` | delete a note | 200 | 404 |

Validation: title is required (3 to 100 characters), content is required
(at least 10 characters). Errors return `{ "success": false, "errors": [...] }`.

## Project structure

```
app/
  layout.jsx              root layout, theme, navbar, 3D background
  page.jsx                home, notes grid
  create/page.jsx         create note
  edit/[id]/page.jsx      edit note (dynamic route)
  search/page.jsx         search results
  providers.jsx           theme and settings context
  api/notes/route.js      GET all, POST new
  api/notes/[id]/route.js PUT update, DELETE by id
components/               Navbar, NoteCard, NoteForm, SettingsModal, ThreeScene, ...
lib/
  store.js                in-memory notes array and helpers
  socket.js               client socket hook
  format.js               time and category helpers
server.js                 custom server: Next.js + Socket.io on one port
```

## Storage

There is no database by design. Notes are held in a JavaScript array on the
server and reset whenever the server restarts. The focus here is API design
and CRUD logic, not persistence.
