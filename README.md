## MiniAI Vibe — AI-Powered App Builder

Build full-stack applications from simple prompts using programmable AI agents powered by Inngest. This repo is a learning-by-building journey from zero to production, showcasing a modern, AI-first web stack.

Built with Next.js 15, React 19, Tailwind v4, shadcn/ui, tRPC, Prisma, Neon, and Inngest.

### Key Features
- 🚀 Next.js 15 + React 19
- 🎨 Tailwind v4 + Shadcn/ui
- 📡 tRPC for full-stack type safety
- 🔁 Inngest background jobs
- 🧠 Inngest agent toolkit
- 🔐 Clerk authentication
- 💳 Clerk billing
- 🧱 Component and app generation from AI prompts
- 🗂️ Live project preview with URL access
- 🖥️ E2B cloud sandboxes for runtime execution
- 🐳 Docker-based sandbox templating
- 🧠 AI model support (OpenAI, Anthropic, Grok)
- 📦 Prisma + Neon for database integration
- 🤖 CodeRabbit AI-powered PR reviews
- 🧾 Built-in credit system with usage tracking
- 🧪 Preview + code explorer toggle

---

## Project Roadmap & Timestamps

Use this as your course outline and progress tracker.

0:00 Intro & Demo
- [x] Watch the feature overview and end-to-end flow

7:06 01 Setup
- [x] Scaffold Next.js 15 + Tailwind v4 + shadcn/ui
- [x] Install core deps (tRPC, Prisma, Inngest)

23:51 02 Database
- [x] Set up Prisma schema
- [x] Create Neon Postgres project and connection
- [x] Run migrations and seed

49:08 03 tRPC Setup
- [x] Create router and server adapter at `/api/trpc`
- [x] Add client/provider and demo route
- [x] Move demo to `/trpc-demo` page to keep homepage clean

01:25:33 04 Background Jobs
- [x] Install and initialize Inngest
- [x] Create `helloWorld` function
- [x] Serve handler at `/api/inngest`
- [x] Add minimal button on homepage to trigger job

01:53:41 05 AI Jobs
- [ ] Add AI model calls (OpenAI/Anthropic/Grok) inside Inngest steps

02:19:46 06 E2B Sandboxes
- [ ] Run generated code securely inside E2B cloud sandboxes
- [ ] Add Docker-based sandbox templates

02:59:41 07 Agent Tools
- [ ] Design agent architecture and tools (file ops, code gen, PRs)

03:47:09 08 Messages
- [ ] Message schema, history, streaming

04:16:56 09 Projects
- [ ] Project model, ownership, lifecycle

04:36:36 10 Messages UI
- [ ] Chat UI with code blocks and actions

05:36:36 11 Project Header
- [ ] Status, actions, and navigation

05:58:41 12 Fragment View
- [ ] Render generated component fragments

06:12:35 13 Code View
- [ ] Explorer + preview toggle

07:06:37 14 Home Page
- [x] Minimal background-job button with Inngest

07:43:17 15 Theme
- [ ] Theme setup (dark/light, system)

07:52:03 16 Authentication
- [ ] Integrate Clerk auth

08:41:23 17 Billing
- [ ] Clerk billing and webhooks

09:31:34 18 Agent Memory
- [ ] Vector store + retrieval for agent context

09:57:50 19 Bug Fixes
- [ ] Stabilize flows and polish

10:19:35 20 Deployment
- [ ] Production build, envs, and deploy

---

## Getting Started

1) Install dependencies
```powershell
npm install
```

2) Run the app (Next.js)
```powershell
npm run dev
```

3) Start the Inngest Dev Server (in a second terminal)
```powershell
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

4) Try the demos
- Home: http://localhost:3000 — Click “Run background job” to queue `helloWorld`
- tRPC: http://localhost:3000/trpc-demo — See tRPC query result

---

## Current Status (What’s implemented)

- Inngest setup with `/api/inngest` handler
- Demo function `helloWorld` (wait 1s, returns greeting)
- Minimal enqueue API `/api/jobs/hello`
- Home page button to invoke the job
- tRPC routing, client/provider, and demo moved to `/trpc-demo`

---

## Environment & Tooling (Planned)

- Clerk: auth and billing (pending)
- E2B + Docker: code execution sandboxes (pending)
- Prisma + Neon: DB already scaffolded; further schema work pending
- AI models: OpenAI, Anthropic, Grok integrations (pending)
- CodeRabbit: PR reviews (pending)

---

## Troubleshooting

- Button says “Failed”
	- Ensure the Inngest Dev Server is running and points to `/api/inngest`.
	- Check terminal logs for the function run.

- tRPC page not loading
	- Verify `/api/trpc` route exists and no type errors in routers.

- Database errors
	- Confirm Prisma schema and run migrations before using DB features.

---

## Contributing

PRs welcome. For AI-assisted reviews, enable CodeRabbit on this repo.
