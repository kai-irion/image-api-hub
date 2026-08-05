# Image API Hub

A ChatGPT-like interface for generating and editing images with OpenAI's
`gpt-image-2` model. Sign in with Google, chat in a familiar
message-thread UI, attach an image to request edits, and organize chats
into projects. Bring your own OpenAI API key — each user's key is
encrypted at rest and used only for their own requests.

## Features

- Google sign-in via Supabase Auth
- Chat-style thread UI for image generation and editing
- Attach an existing image to request an edit
- Group chats into projects
- Per-user OpenAI API key, encrypted at rest — no shared/pooled billing

## Tech stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — Google OAuth, Postgres, file storage
- [OpenAI API](https://platform.openai.com/) — `gpt-image-2`
- Deployed on [Vercel](https://vercel.com/)

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com/) project with Google OAuth configured
- An OpenAI API key from an **organization verified for `gpt-image-2`**
  (see note below)

## Local setup

1. **Clone and install dependencies**

   ```bash
   git clone <repo-url>
   cd image-api-hub
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.local.example` to `.env.local` and fill in the values:

   ```bash
   cp .env.local.example .env.local
   ```

   | Variable | Description |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | From Supabase Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase Project Settings → API |
   | `ENCRYPTION_KEY` | Server-side secret used to encrypt stored OpenAI API keys. Generate with `openssl rand -base64 32` |

3. **Set up the database**

   In the Supabase SQL Editor, run `supabase/schema.sql`. It's idempotent
   and safe to re-run — it creates the `profiles`, `projects`, `chats`,
   `messages`, and `user_settings` tables, row-level security policies,
   and a private `generated-images` storage bucket.

4. **Enable Google OAuth in Supabase**

   In your Supabase project, go to Authentication → Providers → Google
   and configure it with a Google OAuth client (Authorized redirect URI:
   `<your-supabase-url>/auth/v1/callback`).

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   The app runs at [http://localhost:3000](http://localhost:3000).

6. **Add your OpenAI API key**

   Sign in, then add your OpenAI API key on the Settings page. It's
   encrypted before being stored and used only for your own image
   generation requests.

## A note on `gpt-image-2` access

OpenAI gates access to `gpt-image-2` behind **organization verification**.
Each user needs their own OpenAI account with a verified organization to
generate images — an unverified account's API key will be rejected by
OpenAI even though it's valid for other endpoints. See OpenAI's
[organization verification docs](https://help.openai.com/en/articles/10910291-api-organization-verification)
for how to verify.

## Project structure

```
app/                Next.js App Router pages and API routes
  api/generate/      Image generation/edit endpoint
  api/settings/      OpenAI API key storage endpoint
  auth/callback/     Supabase OAuth callback handler
components/          UI components (chat, sidebar, settings, projects)
lib/                 Supabase clients, encryption helpers, shared types
supabase/schema.sql  Database schema, RLS policies, storage bucket setup
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase |
