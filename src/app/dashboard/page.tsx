"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  clearSession,
  getAccessToken,
  getStoredUser,
  postJson,
  type AuthUser
} from "@/app/lib/auth-client";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    const stored = getStoredUser();
    if (!token || !stored) {
      router.replace("/login");
      return;
    }
    fetch("/api/v1/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.data?.user) {
          clearSession();
          router.replace("/login");
          return;
        }
        setUser({ ...stored, ...json.data.user });
      })
      .catch(() => {
        clearSession();
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function onLogout() {
    setLoggingOut(true);
    await postJson("/api/v1/auth/logout", {});
    clearSession();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="page">
        <div className="card">
          <p className="subtitle">Đang tải...</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="page">
      <div className="card dashboard">
        <h1>Xin chào 👋</h1>
        <p className="subtitle">Bạn đã đăng nhập vào BadmintonFinder.</p>

        <div className="meta">
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>ID:</strong> {user.id}
          </div>
          {user.createdAt && (
            <div>
              <strong>Tạo lúc:</strong> {new Date(user.createdAt).toLocaleString("vi-VN")}
            </div>
          )}
        </div>

        <button className="btn" onClick={onLogout} disabled={loggingOut}>
          {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
        </button>
      </div>
    </main>
  );
}
