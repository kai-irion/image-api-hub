"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockChats, mockProjects } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

type SidebarProps = {
  userEmail: string | null;
};

export function Sidebar({ userEmail }: SidebarProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const unfiledChats = mockChats.filter((chat) => chat.projectId === null);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="p-3">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <PlusIcon />
          New chat
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        <SidebarSection title="Projects">
          {mockProjects.map((project) => (
            <div key={project.id} className="mb-1">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-neutral-700 transition hover:bg-neutral-200/60 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <FolderIcon />
                <span className="truncate">{project.name}</span>
              </button>
              <div className="ml-5 border-l border-neutral-200 pl-2 dark:border-neutral-800">
                {mockChats
                  .filter((chat) => chat.projectId === project.id)
                  .map((chat) => (
                    <ChatLink key={chat.id} title={chat.title} />
                  ))}
              </div>
            </div>
          ))}
        </SidebarSection>

        <SidebarSection title="Recent chats">
          {unfiledChats.map((chat) => (
            <ChatLink key={chat.id} title={chat.title} />
          ))}
        </SidebarSection>
      </nav>

      <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-700 transition hover:bg-neutral-200/60 dark:text-neutral-300 dark:hover:bg-neutral-800"
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
            className="shrink-0 text-xs font-medium text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 first:mt-0">
      <h2 className="px-2 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
        {title}
      </h2>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ChatLink({ title }: { title: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 truncate rounded-md px-2 py-1.5 text-left text-sm text-neutral-600 transition hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800"
    >
      <span className="truncate">{title}</span>
    </button>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 4.5A1.5 1.5 0 0 1 3.5 3h2.6a1.5 1.5 0 0 1 1.2.6l.6.8a1.5 1.5 0 0 0 1.2.6H12.5A1.5 1.5 0 0 1 14 6.5v5A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
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
