export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export interface EditState {
  originalImage: string | null; // base64
  history: string[]; // Array of base64 strings
  currentIndex: number;
}

export interface Suggestion {
  text: string;
}
