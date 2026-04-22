"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ProfileForm } from "@/app/(profile)/_components/profile-form";
import {
  clearSession,
  getAccessToken,
  getStoredUser,
  type AuthUser
} from "@/app/lib/auth-client";
import { createProfile, fetchMyProfile, type ProfileInput } from "@/app/lib/profile-client";

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    const stored = getStoredUser();
    if (!token || !stored) {
      router.replace("/login");
      return;
    }
    fetchMyProfile().then((res) => {
      if (res.ok) {
        router.replace("/profile");
        return;
      }
      if (res.error.code === "TOKEN_INVALID" || res.error.code === "NO_ACCESS_TOKEN") {
        clearSession();
        router.replace("/login");
        return;
      }
      setUser(stored);
      setLoading(false);
    });
  }, [router]);

  async function onSubmit(input: ProfileInput): Promise<void> {
    const res = await createProfile(input);
    if (!res.ok) {
      throw new Error(res.error.message);
    }
    router.replace("/profile");
  }

  if (loading || !user) {
    return (
      <main className="page">
        <div className="card"><p className="subtitle">Đang tải...</p></div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="card profile-card">
        <h1>Hồ sơ của bạn</h1>
        <p className="subtitle">
          Cho chúng tôi biết bạn chơi như thế nào để gợi ý buổi giao lưu phù hợp.
        </p>
        <ProfileForm
          submitLabel="Lưu hồ sơ"
          submittingLabel="Đang lưu..."
          onSubmit={onSubmit}
        />
      </div>
    </main>
  );
}
