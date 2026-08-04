import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar userEmail={user?.email ?? null} />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
