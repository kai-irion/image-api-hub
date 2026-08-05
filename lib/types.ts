export type ChatSummary = {
  id: string;
  title: string;
  projectId: string | null;
  updatedAt: string;
  starred: boolean;
};

export type Project = {
  id: string;
  name: string;
};

export type ProjectDetail = Project & {
  description: string | null;
  instructions: string | null;
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
