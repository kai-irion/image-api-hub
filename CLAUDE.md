# Image API Hub

A ChatGPT-like web app for generating and editing images through OpenAI's
gpt-image-2 API. Users sign in with Google, chat in a familiar
message-thread UI, and can attach an image to request edits. Chats can be
grouped into projects. Each user supplies and stores their own OpenAI API
key (encrypted at rest) on the settings page.

**Stack:** Next.js (App Router, TypeScript), Tailwind CSS, deployed to
Vercel. Supabase for auth (Google OAuth), Postgres database, and file
storage.

The project is currently scaffolded with placeholder/mock UI only — no
OpenAI API calls or database schema are wired up yet.

# Developer workflow: git worktrees

This repo uses git worktrees to run multiple Claude Code agents in parallel
without them interfering with each other's branches or uncommitted changes.

## Rules for any agent working in this repo

1. Never run `git checkout` or `git switch` to change the branch of the
   current folder. Each folder is permanently tied to one branch (it's a
   worktree). Switching branches inside a worktree breaks the setup for
   whichever other agent/window is also using this folder.
2. If a task needs a new branch, do not create it inside the current
   worktree. Tell the user to run `./new-agent.sh <task-name>` from the
   main repo folder instead — this creates a fresh worktree + branch pair
   and opens it in a new VS Code window.
3. Commit and push your own worktree's branch when a task is done. Open a
   PR against `main`. Do not merge directly to `main` without review.
4. Once a branch is merged, the user (or you, if asked) can clean up with
   `./close-agent.sh <task-name>` from the main repo folder.
5. Assume other agents may be working in sibling worktree folders
   (`../<repo-name>-<other-task>`) at the same time. Don't touch files
   outside your own worktree folder.

## Folder layout

```
~/dev/
  image2-hub/                  <- main repo, always on `main`, never edited directly by agents
  image2-hub-google-auth/      <- worktree for the google-auth task, branch feature/google-auth
  image2-hub-image-gen/        <- worktree for the image-gen task, branch feature/image-gen
  image2-hub-settings-page/    <- worktree for the settings-page task, branch feature/settings-page
```

## Scripts

- `./new-agent.sh <task-name>` — creates branch `feature/<task-name>`, creates
  a sibling worktree folder, opens it in a new VS Code window.
- `./close-agent.sh <task-name>` — removes the worktree folder once its PR
  is merged (branch itself is left for manual deletion).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
