export interface Folder {
  id: string;
  name: string;
  parentId?: string; // for nested folders (future-ready, UI is single-level)
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_FOLDER_ID = 'default-folder';
export const DEFAULT_FOLDER_NAME = 'My Projects';
