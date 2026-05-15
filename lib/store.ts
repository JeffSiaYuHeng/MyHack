import { create } from 'zustand'
import { AppState, Message } from './types'

export const useStore = create<AppState>((set) => ({
  messages: [],
  user: null,
  addMessage: (message: Message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  setUser: (user: any) => set({ user }),
}))
