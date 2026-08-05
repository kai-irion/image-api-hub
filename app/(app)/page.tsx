import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ChatIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: chat, error } = await supabase
    .from("chats")
    .insert({ title: "New chat" })
    .select("id")
    .single();

  if (error || !chat) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md text-center text-sm text-neutral-500 dark:text-neutral-400">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            Couldn&apos;t create a new chat.
          </p>
          <p className="mt-1">
            Make sure the database schema has been applied — run{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">
              supabase/schema.sql
            </code>{" "}
            in your Supabase project&apos;s SQL editor.
          </p>
        </div>
      </div>
    );
  }

  redirect(`/chat/${chat.id}`);
}
