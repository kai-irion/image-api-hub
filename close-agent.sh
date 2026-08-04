#!/usr/bin/env bash
# close-agent.sh - remove a worktree once its task is merged.
# Usage: ./close-agent.sh <task-name>
# Example: ./close-agent.sh google-auth

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: ./close-agent.sh <task-name>"
  exit 1
fi

TASK="$1"
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")
PARENT_DIR=$(dirname "$REPO_ROOT")
WORKTREE_DIR="$PARENT_DIR/${REPO_NAME}-${TASK}"
BRANCH="feature/${TASK}"

cd "$REPO_ROOT"

echo "Removing worktree at $WORKTREE_DIR..."
git worktree remove "$WORKTREE_DIR" --force

echo ""
echo "Worktree removed. Branch $BRANCH still exists locally."
echo "Once its PR is merged, delete the branch with:"
echo "  git branch -d $BRANCH"
