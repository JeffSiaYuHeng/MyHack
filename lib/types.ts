export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export interface ResultType {
  id?: string;
  title: string;
  data: unknown;
  createdAt: unknown;
}

export interface AppState {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  user: unknown | null;
  setUser: (user: unknown | null) => void;
}
