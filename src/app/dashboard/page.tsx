"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  clearSession,
  getAccessToken,
  getStoredUser,
  postJson,
  type AuthUser
} from "@/app/lib/auth-client";
import { fetchMyProfile, type ProfilePublic } from "@/app/lib/profile-client";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ProfilePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    const stored = getStoredUser();
    if (!token || !stored) {
      router.replace("/login");
      return;
    }
    Promise.all([
      fetch("/api/v1/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then(async (res) => {
          const json = await res.json().catch(() => null);
          if (!res.ok || !json?.data?.user) throw new Error("session-invalid");
          return json.data.user as AuthUser;
        }),
      fetchMyProfile()
    ])
      .then(([fresh, profRes]) => {
        setUser({ ...stored, ...fresh });
        if (profRes.ok) {
          setProfile(profRes.data.profile);
        } else if (profRes.error.code === "PROFILE_NOT_FOUND") {
          router.replace("/onboarding");
          return;
        }
        setLoading(false);
      })
      .catch(() => {
        clearSession();
        router.replace("/login");
      });
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
        <div className="card"><p className="subtitle">Đang tải...</p></div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="page">
      <div className="card dashboard">
        <h1>Xin chào {profile?.displayName ?? ""} 👋</h1>
        <p className="subtitle">Bạn đã đăng nhập vào BadmintonFinder.</p>

        <div className="meta">
          <div><strong>Email:</strong> {user.email}</div>
          {profile && (
            <>
              <div><strong>Trình độ:</strong> {profile.level} (±{profile.levelTolerance})</div>
              <div><strong>Khu vực:</strong> {profile.city} — {profile.districts.join(", ")}</div>
              <div><strong>Ngân sách:</strong> {profile.budgetVnd.toLocaleString("vi-VN")} VND</div>
            </>
          )}
        </div>

        <div className="dashboard-actions">
          <Link href="/profile" className="btn btn-secondary">Chỉnh sửa hồ sơ</Link>
          <button className="btn" onClick={onLogout} disabled={loggingOut}>
            {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
        </div>
      </div>
    </main>
  );
}
