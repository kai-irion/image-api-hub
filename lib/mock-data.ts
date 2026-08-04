import type { ChatMessage, ChatSummary, Project } from "@/lib/types";

export const mockProjects: Project[] = [
  { id: "proj-1", name: "Product mockups" },
  { id: "proj-2", name: "Blog illustrations" },
];

export const mockChats: ChatSummary[] = [
  {
    id: "chat-1",
    title: "Cozy cabin in the woods",
    projectId: "proj-1",
    updatedAt: "2026-08-04T09:00:00Z",
  },
  {
    id: "chat-2",
    title: "Logo variations, flat style",
    projectId: "proj-1",
    updatedAt: "2026-08-03T15:30:00Z",
  },
  {
    id: "chat-3",
    title: "Editing product photo background",
    projectId: "proj-2",
    updatedAt: "2026-08-02T11:15:00Z",
  },
  {
    id: "chat-4",
    title: "Isometric city illustration",
    projectId: null,
    updatedAt: "2026-08-01T18:45:00Z",
  },
];

export const mockMessages: ChatMessage[] = [
  {
    id: "msg-1",
    role: "user",
    content: "Generate a cozy cabin in the woods, autumn, warm lighting.",
  },
  {
    id: "msg-2",
    role: "assistant",
    content: "Here's a cozy autumn cabin concept for you.",
    imageUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512'%3E%3Crect width='512' height='512' fill='%23e7dfd3'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='20' fill='%23999' text-anchor='middle' dy='.3em'%3Emock image%3C/text%3E%3C/svg%3E",
  },
];
