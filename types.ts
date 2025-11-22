export type Role = 'user' | 'ai' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  image?: string; // Base64 data URL of an image associated with the message
  isError?: boolean;
}

export interface ImageState {
  original: string | null;
  current: string | null; // The version currently being edited/viewed
  history: string[]; // Stack for undo functionality (optional, but good structure)
}
