export const AUTH_STORAGE_KEY = "capacity-studio.basic-auth";

export type AuthenticatedUser = {
  user_id: string;
  role: string;
};

export function createBasicAuthorization(username: string, password: string): string {
  return `Basic ${window.btoa(`${username}:${password}`)}`;
}

export function getStoredAuthorization(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(AUTH_STORAGE_KEY);
}

export function storeAuthorization(authorization: string): void {
  window.sessionStorage.setItem(AUTH_STORAGE_KEY, authorization);
}

export function clearStoredAuthorization(): void {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
