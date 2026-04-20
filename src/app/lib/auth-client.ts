"use client";

export interface AuthUser {
  id: string;
  email: string;
  createdAt?: string;
}

const ACCESS_KEY = "bf.accessToken";
const USER_KEY = "bf.user";

export function saveSession(accessToken: string, user: AuthUser): void {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function postJson<T>(
  url: string,
  body: unknown
): Promise<{ ok: true; data: T } | { ok: false; error: { code: string; message: string } }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "same-origin"
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json || json.error) {
    return {
      ok: false,
      error: json?.error ?? { code: "NETWORK_ERROR", message: "Request failed" }
    };
  }
  return { ok: true, data: json.data as T };
}
