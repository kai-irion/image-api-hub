#!/usr/bin/env bash
# new-agent.sh - create an isolated git worktree + branch, then open it in a new VS Code window.
# Usage: ./new-agent.sh <task-name>
# Example: ./new-agent.sh google-auth

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: ./new-agent.sh <task-name>"
  echo "Example: ./new-agent.sh google-auth"
  exit 1
fi

TASK="$1"
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")
PARENT_DIR=$(dirname "$REPO_ROOT")
WORKTREE_DIR="$PARENT_DIR/${REPO_NAME}-${TASK}"
BRANCH="feature/${TASK}"

cd "$REPO_ROOT"

echo "Fetching latest from origin..."
git fetch origin

if git show-ref --quiet "refs/heads/$BRANCH"; then
  echo "Branch $BRANCH already exists locally, reusing it."
else
  echo "Creating branch $BRANCH from origin/main..."
  git branch "$BRANCH" origin/main
fi

if [ -d "$WORKTREE_DIR" ]; then
  echo "Worktree folder already exists at $WORKTREE_DIR"
else
  echo "Creating worktree at $WORKTREE_DIR..."
  git worktree add "$WORKTREE_DIR" "$BRANCH"
fi

echo "Opening new VS Code window..."
code "$WORKTREE_DIR"

echo ""
echo "Agent workspace ready:"
echo "  Branch: $BRANCH"
echo "  Folder: $WORKTREE_DIR"
echo ""
echo "Next: in the new VS Code window's integrated terminal, run 'claude' to start the agent there."
