import type { ChatSummary, Project } from "@/lib/types";

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
