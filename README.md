# 🚀 **Drazy — Real-time Collaborative Whiteboard (WIP)**

Drazy is a **work-in-progress real-time collaborative whiteboard**, built with a **monorepo architecture** using **Next.js**, **Node.js**, **WebSockets**, and **PostgreSQL**.
The **custom canvas engine** and **multi-user real-time sync** are functional, while the rest of the UI and workflows are currently under development.

---

## 🔥 **Current Status (Accurate to Project Progress)**

### ✅ **Completed**

* 🎨 **Custom Canvas Engine (Vanilla JS + TypeScript)**

  * Drawing shapes
  * Resizing
  * Moving
  * Deleting
  * Modular OOP design (encapsulation, inheritance)

* ⚡ **Real-time WebSocket Sync**

  * Clients receive updates instantly
  * Reliable event broadcasting
  * Optimized message routing

* 🧵 **In-Memory Operation Queue + Batching**

  * Reduces DB writes
  * Flushes events every 2 seconds
  * Prevents redundant updates

* 🛢 **Backend + Database Setup**

  * Node.js + Express backend
  * PostgreSQL + Prisma ORM
  * Stable schema + migrations
  * API endpoints for project data

* 🔐 **Basic Project Save / Load Pipeline**

  * Persist canvas shapes in DB
  * Load shapes on refresh

### 🚧 **In Progress**

* Full Next.js UI
* Auth system (JWT)
* Toolbar, color picker, shape controls
* Multi-project dashboard
* Project preview thumbnails
* Room management
* Undo/redo stack
* Export to image/PDF
* Better cursor sync

---

## 🧰 **Tech Stack**

**Frontend (WIP):**

* Next.js
* React
* Tailwind CSS
* TypeScript

**Backend (Functional):**

* Node.js
* Express
* WebSocket Server (ws)
* PostgreSQL
* Prisma ORM

**Dev Tools:**

* TurboRepo (monorepo)
* ESLint + Prettier
* Git / GitHub

---

## ⚙️ **Architecture Overview**

### 🔹 1. Canvas Engine

A custom engine built with TypeScript + OOP principles:

* Shape classes
* Transform handlers
* Rendering pipeline
* Event abstraction

### 🔹 2. WebSocket Sync

All drawing operations are:

1. Converted into unified event objects
2. Sent instantly to the WebSocket server
3. Broadcast to all connected clients
4. Applied to the canvas in <100ms

### 🔹 3. Batching System

Backend batches multiple operations and writes to DB every 2 seconds, improving:

* Performance
* DB load
* Network stability

### 🔹 4. Database Persistence

PostgreSQL stores:

* Projects
* Shape states
* Operation batches

---

## 🚀 **Roadmap**

* [ ] Full editor UI (toolbar, shapes, colors)
* [ ] JWT authentication
* [ ] Collaborative cursors
* [ ] Export options (PNG/PDF)
* [ ] Undo/Redo
* [ ] Real-time presence indicators
* [ ] Multi-room architecture
* [ ] Sharing links
* [ ] Version history

---

## ⭐ **Contributions**

This project is currently in active development.
Suggestions, issues, and PRs are welcome!

---

## ❤️ **Support**

If you like where this project is heading, consider starring ⭐ the repo!
or
👉 **“Next: Food Share”**
