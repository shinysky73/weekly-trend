import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function decodeUser(token: string): AuthUser {
  const payload = JSON.parse(decodeBase64Url(token.split('.')[1]));
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  };
}

function loadInitialState(): Pick<AuthState, 'token' | 'user' | 'isAuthenticated'> {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      return { token, user: decodeUser(token), isAuthenticated: true };
    } catch {
      localStorage.removeItem('token');
    }
  }
  return { token: null, user: null, isAuthenticated: false };
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadInitialState(),

  setToken: (token: string) => {
    localStorage.setItem('token', token);
    set({
      token,
      user: decodeUser(token),
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
