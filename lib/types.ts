export type ChatSummary = {
  id: string;
  title: string;
  projectId: string | null;
  updatedAt: string;
};

export type Project = {
  id: string;
  name: string;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  imageUrl?: string;
  attachmentName?: string;
  status?: "pending" | "error";
};
