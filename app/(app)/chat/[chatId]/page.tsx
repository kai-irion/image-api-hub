import Link from "next/link";
import { redirect } from "next/navigation";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ChatTitle } from "@/components/chat/chat-title";
import { InfoIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage } from "@/lib/types";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  const supabase = await createClient();

  const { data: chat, error: chatError } = await supabase
    .from("chats")
    .select("id, title, project_id")
    .eq("id", chatId)
    .maybeSingle();

  if (chatError) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md text-center text-sm text-neutral-500 dark:text-neutral-400">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            Couldn&apos;t load this chat.
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

  if (!chat) {
    redirect("/");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasApiKey = true;
  if (user) {
    const { data } = await supabase
      .from("user_settings")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    hasApiKey = data !== null;
  }

  let project: { id: string; name: string } | null = null;
  if (chat.project_id) {
    const { data } = await supabase
      .from("projects")
      .select("id, name, instructions")
      .eq("id", chat.project_id)
      .maybeSingle();
    if (data?.instructions?.trim()) {
      project = { id: data.id, name: data.name };
    }
  }

  const { data: rows } = await supabase
    .from("messages")
    .select("id, role, content, image_path")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  const initialMessages: ChatMessage[] = await Promise.all(
    (rows ?? []).map(async (row) => {
      let imageUrl: string | undefined;
      if (row.image_path) {
        const { data: signed } = await supabase.storage
          .from("generated-images")
          .createSignedUrl(row.image_path, SIGNED_URL_TTL_SECONDS);
        imageUrl = signed?.signedUrl;
      }

      return {
        id: row.id,
        role: row.role as "user" | "assistant",
        content: row.content,
        imageUrl,
      };
    }),
  );

  return (
    <>
      <header className="flex h-14 shrink-0 items-center border-b border-neutral-200 px-6 dark:border-neutral-800">
        <ChatTitle key={chat.id} chatId={chat.id} title={chat.title} />
      </header>

      {!hasApiKey && (
        <div className="flex items-center gap-2 border-b border-sky-200 bg-sky-50 px-6 py-2 text-xs text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300">
          <InfoIcon />
          Add your OpenAI API key in{" "}
          <Link
            href="/settings"
            className="font-medium underline transition-colors duration-150 hover:text-sky-950 dark:hover:text-sky-100"
          >
            Settings
          </Link>{" "}
          to start generating images.
        </div>
      )}

      {project && (
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-6 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <InfoIcon />
          Using project instructions from{" "}
          <Link
            href={`/projects/${project.id}`}
            className="font-medium underline transition-colors duration-150 hover:text-amber-950 dark:hover:text-amber-100"
          >
            {project.name}
          </Link>
        </div>
      )}

      <ChatPanel key={chatId} chatId={chatId} initialMessages={initialMessages} />
    </>
  );
}
