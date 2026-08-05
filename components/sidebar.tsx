"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FolderIcon, PlusIcon } from "@/components/icons";
import { ChatRow } from "@/components/sidebar/chat-row";
import type { ChatSummary, Project } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

type SidebarProps = {
  userEmail: string | null;
  projects: Project[];
  chats: ChatSummary[];
};

export function Sidebar({ userEmail, projects, chats }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleNewChat() {
    if (isCreatingChat) return;
    setIsCreatingChat(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("chats")
      .insert({ title: "New chat" })
      .select("id")
      .single();

    setIsCreatingChat(false);

    if (error || !data) {
      return;
    }

    router.push(`/chat/${data.id}`);
    router.refresh();
  }

  async function handleCreateProject() {
    const name = newProjectName.trim();
    setIsAddingProject(false);
    setNewProjectName("");
    if (!name) return;

    const supabase = createClient();
    const { error } = await supabase.from("projects").insert({ name });
    if (!error) router.refresh();
  }

  const starredChats = chats.filter((chat) => chat.starred);
  const unfiledChats = chats.filter((chat) => chat.projectId === null);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="p-3">
        <button
          type="button"
          onClick={handleNewChat}
          disabled={isCreatingChat}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <PlusIcon />
          New chat
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {chats.length === 0 && projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 px-4 py-12 text-center">
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              No chats yet
            </p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              Start one above to get going
            </p>
          </div>
        ) : (
          <>
            {starredChats.length > 0 && (
              <SidebarSection title="Starred">
                {starredChats.map((chat) => (
                  <ChatRow
                    key={chat.id}
                    chat={chat}
                    projects={projects}
                    active={pathname === `/chat/${chat.id}`}
                  />
                ))}
              </SidebarSection>
            )}

            <SidebarSection
              title="Projects"
              onAdd={() => {
                setIsAddingProject(true);
              }}
            >
              {isAddingProject && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleCreateProject();
                  }}
                  className="mb-1"
                >
                  <input
                    autoFocus
                    value={newProjectName}
                    onChange={(event) => setNewProjectName(event.target.value)}
                    onBlur={() => {
                      setIsAddingProject(false);
                      setNewProjectName("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setIsAddingProject(false);
                        setNewProjectName("");
                      }
                    }}
                    placeholder="Project name"
                    className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 outline-none transition-colors duration-150 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                </form>
              )}

              {projects.length === 0 && !isAddingProject ? (
                <p className="px-2 py-1 text-sm text-neutral-400 dark:text-neutral-500">
                  No projects yet
                </p>
              ) : (
                projects.map((project) => (
                  <div key={project.id} className="mb-1">
                    <Link
                      href={`/projects/${project.id}`}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-150 ${
                        pathname === `/projects/${project.id}`
                          ? "bg-neutral-200/80 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                          : "text-neutral-700 hover:bg-neutral-200/60 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <FolderIcon />
                      <span className="truncate">{project.name}</span>
                    </Link>
                    <div className="ml-5 border-l border-neutral-200 pl-2 dark:border-neutral-800">
                      {chats
                        .filter((chat) => chat.projectId === project.id)
                        .map((chat) => (
                          <ChatRow
                            key={chat.id}
                            chat={chat}
                            projects={projects}
                            active={pathname === `/chat/${chat.id}`}
                          />
                        ))}
                    </div>
                  </div>
                ))
              )}
            </SidebarSection>

            <SidebarSection title="Recent chats">
              {unfiledChats.length === 0 ? (
                <p className="px-2 py-1 text-sm text-neutral-400 dark:text-neutral-500">
                  No chats yet
                </p>
              ) : (
                unfiledChats.map((chat) => (
                  <ChatRow
                    key={chat.id}
                    chat={chat}
                    projects={projects}
                    active={pathname === `/chat/${chat.id}`}
                  />
                ))
              )}
            </SidebarSection>
          </>
        )}
      </nav>

      <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-700 transition-colors duration-150 hover:bg-neutral-200/60 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <SettingsIcon />
          Settings
        </Link>

        <div className="mt-2 flex items-center justify-between gap-2 px-2">
          <span className="truncate text-xs text-neutral-500 dark:text-neutral-400">
            {userEmail ?? "Signed in"}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="shrink-0 rounded px-1 py-0.5 text-xs font-medium text-neutral-500 transition-colors duration-150 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}

function SidebarSection({
  title,
  onAdd,
  children,
}: {
  title: string;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 first:mt-0">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
          {title}
        </h2>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            aria-label={`New ${title.toLowerCase()}`}
            className="rounded p-0.5 text-neutral-400 transition-colors duration-150 hover:bg-neutral-200/60 hover:text-neutral-700 active:scale-90 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <PlusIcon size={12} />
          </button>
        )}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2.3" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 1.5v1.6M8 12.9v1.6M14.5 8h-1.6M3.1 8H1.5M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1M12.4 12.4l-1.1-1.1M4.7 4.7 3.6 3.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
