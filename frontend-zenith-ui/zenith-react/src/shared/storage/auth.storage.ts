const TOKEN_KEY = "zenith_access_token";
const REFRESH_TOKEN_KEY = "zenith_refresh_token";
const USER_KEY = "zenith_user";

export interface StoredUser {
  id: string;
  credentialId: number;
  credentialCode: string;
  profileCode: string;
  email?: string;
  fullName?: string;
}

export const authStorage = {
  getToken: (): string | null => {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: (): void => {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: (token: string): void => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  removeRefreshToken: (): void => {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  getUser: (): StoredUser | null => {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  },

  setUser: (user: StoredUser): void => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser: (): void => {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(USER_KEY);
  },

  clear: (): void => {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
