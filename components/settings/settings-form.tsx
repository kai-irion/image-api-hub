"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";

type SaveState = "idle" | "saving" | "saved" | "error";

export function SettingsForm({ hasKey: initialHasKey }: { hasKey: boolean }) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [hasKey, setHasKey] = useState(initialHasKey);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaveState("saving");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/settings/openai-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save the key.");
      }

      setApiKey("");
      setHasKey(true);
      setSaveState("saved");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save the key.");
      setSaveState("error");
    }
  }

  async function handleRemove() {
    setIsRemoving(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/settings/openai-key", { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to remove the key.");
      }

      setHasKey(false);
      setApiKey("");
      setSaveState("idle");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to remove the key.");
      setSaveState("error");
    } finally {
      setIsRemoving(false);
      setConfirmRemoveOpen(false);
    }
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
        OpenAI API key
      </h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Used to generate and edit images with your own OpenAI account. Your
        key is encrypted before it&apos;s stored.
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
            placeholder={hasKey ? "sk-...saved" : "sk-..."}
            autoComplete="off"
            spellCheck={false}
            className="w-full flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 focus:border-neutral-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
          <button
            type="button"
            onClick={() => setShowKey((prev) => !prev)}
            disabled={!apiKey}
            title={!apiKey ? "Type a key to reveal it" : undefined}
            className="shrink-0 rounded-lg border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-600 transition-colors duration-150 hover:bg-neutral-50 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>
        {hasKey && (
          <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
            A key is already saved. Enter a new one to replace it.
          </p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={!apiKey.trim() || saveState === "saving"}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-40 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {saveState === "saving" ? "Saving..." : "Save key"}
          </button>
          {hasKey && (
            <button
              type="button"
              onClick={() => setConfirmRemoveOpen(true)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-red-50 active:scale-[0.98] dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Remove key
            </button>
          )}
          {saveState === "saved" && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400">Saved</span>
          )}
          {saveState === "error" && errorMessage && (
            <span className="text-sm text-red-600 dark:text-red-400">{errorMessage}</span>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={confirmRemoveOpen}
        title="Remove API key?"
        message="You'll need to add it again before you can generate images."
        confirmLabel="Remove"
        isConfirming={isRemoving}
        onConfirm={handleRemove}
        onCancel={() => setConfirmRemoveOpen(false)}
      />
    </section>
  );
}
