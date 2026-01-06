import { DEFAULT_FOLDER_ID } from './folder';

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  currentPromptVersion: string;
  tags?: string[];
  systemPrompt?: string;
  folderId: string;
}

export { DEFAULT_FOLDER_ID };
