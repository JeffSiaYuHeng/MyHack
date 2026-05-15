export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export interface ResultType {
  id?: string;
  title: string;
  data: any;
  createdAt: any;
}

export interface AppState {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  user: any | null;
  setUser: (user: any) => void;
}
