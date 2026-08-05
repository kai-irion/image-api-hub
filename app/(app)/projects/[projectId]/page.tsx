import { redirect } from "next/navigation";
import { BackButton } from "@/components/back-button";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { NewChatInProjectButton } from "@/components/projects/new-chat-in-project-button";
import { ProjectTextField } from "@/components/projects/project-text-field";
import { ProjectTitle } from "@/components/projects/project-title";
import { ChatRow } from "@/components/sidebar/chat-row";
import { createClient } from "@/lib/supabase/server";
import type { ChatSummary } from "@/lib/types";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name, description, instructions")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md text-center text-sm text-neutral-500 dark:text-neutral-400">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            Couldn&apos;t load this project.
          </p>
          <p className="mt-1">
            Make sure the database schema is up to date — run{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">
              supabase/schema.sql
            </code>{" "}
            in your Supabase project&apos;s SQL editor.
          </p>
        </div>
      </div>
    );
  }

  if (!project) {
    redirect("/");
  }

  const [{ data: chatRows }, { data: allProjects }] = await Promise.all([
    supabase
      .from("chats")
      .select("id, title, project_id, updated_at, starred")
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false }),
    supabase.from("projects").select("id, name").order("name"),
  ]);

  const chats: ChatSummary[] = (chatRows ?? []).map((chat) => ({
    id: chat.id,
    title: chat.title,
    projectId: chat.project_id,
    updatedAt: chat.updated_at,
    starred: chat.starred,
  }));

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 px-6 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <BackButton />
          <ProjectTitle projectId={project.id} name={project.name} />
        </div>
        <DeleteProjectButton
          projectId={project.id}
          projectName={project.name}
          chatCount={chats.length}
        />
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-2xl space-y-8">
          <ProjectTextField
            projectId={project.id}
            field="description"
            label="Description"
            placeholder="What's this project for?"
            initialValue={project.description ?? ""}
          />

          <ProjectTextField
            projectId={project.id}
            field="instructions"
            label="Project instructions"
            placeholder="e.g. Always use a flat, minimalist illustration style with a warm color palette."
            helperText="Applied automatically to every image generation in this project's chats."
            initialValue={project.instructions ?? ""}
          />

          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Chats
              </h2>
              <NewChatInProjectButton projectId={project.id} />
            </div>

            <div className="mt-3 space-y-0.5">
              {chats.length === 0 ? (
                <p className="text-sm text-neutral-400 dark:text-neutral-500">
                  No chats in this project yet.
                </p>
              ) : (
                chats.map((chat) => (
                  <ChatRow
                    key={chat.id}
                    chat={chat}
                    projects={allProjects ?? []}
                    active={false}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
