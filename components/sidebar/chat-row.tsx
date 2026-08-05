"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FolderIcon, KebabIcon, PencilIcon, StarIcon, TrashIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import type { ChatSummary, Project } from "@/lib/types";

type ChatRowProps = {
  chat: ChatSummary;
  active: boolean;
  projects: Project[];
};

export function ChatRow({ chat, active, projects }: ChatRowProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [moveExpanded, setMoveExpanded] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(chat.title);
  const [isBusy, setIsBusy] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (isRenaming) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [isRenaming]);

  function closeMenu() {
    setMenuOpen(false);
    setMoveExpanded(false);
  }

  function startRename() {
    setRenameValue(chat.title);
    setIsRenaming(true);
    closeMenu();
  }

  async function submitRename() {
    const title = renameValue.trim();
    setIsRenaming(false);
    if (!title || title === chat.title) return;

    const supabase = createClient();
    await supabase.from("chats").update({ title }).eq("id", chat.id);
    router.refresh();
  }

  async function toggleStar() {
    closeMenu();
    const supabase = createClient();
    await supabase.from("chats").update({ starred: !chat.starred }).eq("id", chat.id);
    router.refresh();
  }

  async function setProject(projectId: string | null) {
    closeMenu();
    const supabase = createClient();
    await supabase.from("chats").update({ project_id: projectId }).eq("id", chat.id);
    router.refresh();
  }

  function handleDelete() {
    closeMenu();
    setConfirmDeleteOpen(true);
  }

  async function confirmDelete() {
    setIsBusy(true);
    const supabase = createClient();
    await supabase.from("chats").delete().eq("id", chat.id);
    setIsBusy(false);
    setConfirmDeleteOpen(false);
    router.refresh();
  }

  return (
    <div ref={containerRef} className="group relative">
      <div
        className={`flex items-center rounded-md transition-colors duration-150 ${
          active
            ? "bg-neutral-200/80 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
            : "text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800"
        } ${isBusy ? "opacity-50" : ""}`}
      >
        {isRenaming ? (
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submitRename();
              if (event.key === "Escape") setIsRenaming(false);
            }}
            onBlur={submitRename}
            className="min-w-0 flex-1 rounded-md bg-white px-2 py-1.5 text-sm text-neutral-900 outline-none ring-1 ring-neutral-300 transition-colors duration-150 dark:bg-neutral-900 dark:text-neutral-100 dark:ring-neutral-700"
          />
        ) : (
          <Link
            href={`/chat/${chat.id}`}
            onContextMenu={(event) => {
              event.preventDefault();
              setMenuOpen(true);
            }}
            className="flex min-w-0 flex-1 items-center gap-1.5 truncate px-2 py-1.5 text-sm"
          >
            {chat.starred && <StarIcon filled />}
            <span className="truncate">{chat.title}</span>
          </Link>
        )}

        {!isRenaming && (
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Chat options"
            className={`mr-1 shrink-0 rounded p-1 text-neutral-400 opacity-0 transition-colors duration-150 hover:bg-neutral-300/60 hover:text-neutral-700 active:scale-90 focus:opacity-100 group-hover:opacity-100 dark:hover:bg-neutral-700 dark:hover:text-neutral-200 ${
              menuOpen ? "opacity-100" : ""
            }`}
          >
            <KebabIcon />
          </button>
        )}
      </div>

      {menuOpen && (
        <div className="absolute right-0 top-full z-20 mt-1 w-52 origin-top-right animate-menu-in rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <MenuItem onClick={startRename} icon={<PencilIcon />}>
            Rename
          </MenuItem>
          <MenuItem onClick={toggleStar} icon={<StarIcon filled={chat.starred} />}>
            {chat.starred ? "Unstar" : "Star"}
          </MenuItem>
          <MenuItem
            onClick={() => setMoveExpanded((prev) => !prev)}
            icon={<FolderIcon />}
            trailing={moveExpanded ? "−" : "+"}
          >
            Move to project
          </MenuItem>
          {moveExpanded && (
            <div className="ml-3 border-l border-neutral-200 pl-2 dark:border-neutral-800">
              {chat.projectId && (
                <MenuItem onClick={() => setProject(null)}>Remove from project</MenuItem>
              )}
              {projects.length === 0 ? (
                <p className="px-3 py-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                  No projects yet
                </p>
              ) : (
                projects.map((project) => (
                  <MenuItem
                    key={project.id}
                    onClick={() => setProject(project.id)}
                    disabled={project.id === chat.projectId}
                  >
                    {project.name}
                    {project.id === chat.projectId ? " ✓" : ""}
                  </MenuItem>
                ))
              )}
            </div>
          )}
          <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />
          <MenuItem
            onClick={handleDelete}
            icon={<TrashIcon />}
            className="text-red-600 dark:text-red-400"
          >
            Delete
          </MenuItem>
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete chat?"
        message={`Delete "${chat.title}"? This can't be undone.`}
        isConfirming={isBusy}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  icon,
  trailing,
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
  trailing?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-neutral-700 transition-colors duration-150 hover:bg-neutral-100 disabled:cursor-default disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-800 ${className}`}
    >
      {icon}
      <span className="flex-1 truncate">{children}</span>
      {trailing && <span className="text-neutral-400">{trailing}</span>}
    </button>
  );
}

