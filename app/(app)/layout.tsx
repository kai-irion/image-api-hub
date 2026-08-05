import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";
import type { ChatSummary, Project } from "@/lib/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let projects: Project[] = [];
  let chats: ChatSummary[] = [];

  if (user) {
    const [projectsResult, chatsResult] = await Promise.all([
      supabase
        .from("projects")
        .select("id, name")
        .eq("owner_id", user.id)
        .order("name"),
      supabase
        .from("chats")
        .select("id, title, project_id, updated_at, starred")
        .eq("owner_id", user.id)
        .order("updated_at", { ascending: false }),
    ]);

    projects = projectsResult.data ?? [];
    chats = (chatsResult.data ?? []).map((chat) => ({
      id: chat.id,
      title: chat.title,
      projectId: chat.project_id,
      updatedAt: chat.updated_at,
      starred: chat.starred,
    }));
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar userEmail={user?.email ?? null} projects={projects} chats={chats} />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
