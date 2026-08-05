import { BackButton } from "@/components/back-button";
import { SettingsForm } from "@/components/settings/settings-form";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasKey = false;
  if (user) {
    const { data } = await supabase
      .from("user_settings")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    hasKey = data !== null;
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 px-6 dark:border-neutral-800">
        <BackButton />
        <h1 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          Settings
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-lg">
          <SettingsForm hasKey={hasKey} />
        </div>
      </div>
    </>
  );
}
