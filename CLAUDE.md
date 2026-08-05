# Developer workflow: git worktrees

This repo uses git worktrees to run multiple Claude Code agents in parallel
without them interfering with each other's branches or uncommitted changes.

As of Claude Code v2.1.49+, worktree creation is built into the CLI itself
via the `--worktree` (or `-w`) flag — no custom scripts needed.

## Rules for any agent working in this repo

1. Never run `git checkout` or `git switch` to change the branch of the
   current folder. Each worktree folder is permanently tied to one branch.
   Switching branches inside a worktree breaks the setup for whichever
   other agent/session is also using this folder.
2. If a task needs a new branch, start a new isolated session instead of
   branching manually: `claude --worktree <task-name>` from the main repo
   folder. This creates a new branch, a new worktree directory (under
   `.claude/worktrees/<task-name>/`), and starts a Claude Code session
   inside it - all in one step.
3. Commit and push your own worktree's branch when a task is done. Open a
   PR against `main`. Do not merge directly to `main` without review.
4. Assume other agents may be working in sibling worktrees at the same
   time. Don't touch files outside your own worktree.
5. Cleanup is mostly automatic: ending a worktree session with no
   uncommitted changes removes the worktree automatically. If there are
   uncommitted changes, Claude Code will ask whether to keep or remove it.

## Running multiple agents at once

Each concurrent agent needs its own terminal (a new tab is enough - a
separate VS Code window is not required, since isolation happens at the
folder/git level, not the window level). If you also want to visually
browse/edit a worktree's files in the VS Code sidebar while it works, add
it via File -> Add Folder to Workspace..., or open it in its own window.

## Starting a new parallel task

    claude --worktree <task-name>

Run from the main repo folder, in a new terminal tab. Omit the name for a
quick throwaway session (`claude --worktree`) - Claude Code will generate
one automatically.
