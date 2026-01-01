export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  currentPromptVersion: string;
  tags?: string[];
}
