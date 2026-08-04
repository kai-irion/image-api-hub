"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SaveState = "idle" | "saving" | "saved";

export default function SettingsPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaveState("saving");
    // Persisting the (encrypted) key is not wired up yet — placeholder only.
    setTimeout(() => setSaveState("saved"), 400);
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 px-6 dark:border-neutral-800">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to chat"
          className="-ml-1.5 flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <BackIcon />
        </button>
        <h1 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          Settings
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-lg">
          <section>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              OpenAI API key
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Used to generate and edit images with your own OpenAI account.
              Your key is encrypted before it&apos;s stored.
            </p>

            <form onSubmit={handleSave} className="mt-4">
              <label
                htmlFor="openai-key"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                API key
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  id="openai-key"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(event) => {
                    setApiKey(event.target.value);
                    setSaveState("idle");
                  }}
                  placeholder="sk-..."
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((prev) => !prev)}
                  className="shrink-0 rounded-lg border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  {showKey ? "Hide" : "Show"}
                </button>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!apiKey.trim() || saveState === "saving"}
                  className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-40 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  {saveState === "saving" ? "Saving..." : "Save key"}
                </button>
                {saveState === "saved" && (
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">
                    Saved
                  </span>
                )}
              </div>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M9.5 3.5 4.5 8l5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
