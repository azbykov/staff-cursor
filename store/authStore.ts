import { create } from 'zustand'

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
})) 