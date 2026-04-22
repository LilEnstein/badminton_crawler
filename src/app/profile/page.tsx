"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ProfileForm } from "@/app/(profile)/_components/profile-form";
import { clearSession, getAccessToken } from "@/app/lib/auth-client";
import {
  fetchMyProfile,
  updateProfile,
  type ProfileInput,
  type ProfilePublic
} from "@/app/lib/profile-client";

function toInput(p: ProfilePublic): ProfileInput {
  return {
    displayName: p.displayName,
    level: p.level,
    levelTolerance: p.levelTolerance,
    city: p.city,
    districts: [...p.districts],
    timeSlots: [...p.timeSlots],
    budgetVnd: p.budgetVnd,
    shuttleType: p.shuttleType,
    genderPreference: p.genderPreference
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfilePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    fetchMyProfile().then((res) => {
      if (res.ok) {
        setProfile(res.data.profile);
        setLoading(false);
        return;
      }
      if (res.error.code === "PROFILE_NOT_FOUND") {
        router.replace("/onboarding");
        return;
      }
      if (res.error.code === "TOKEN_INVALID" || res.error.code === "NO_ACCESS_TOKEN") {
        clearSession();
        router.replace("/login");
        return;
      }
      setLoading(false);
    });
  }, [router]);

  async function onSubmit(input: ProfileInput): Promise<void> {
    const res = await updateProfile(input);
    if (!res.ok) {
      throw new Error(res.error.message);
    }
    setProfile(res.data.profile);
    setSavedAt(new Date().toLocaleTimeString("vi-VN"));
  }

  if (loading) {
    return (
      <main className="page">
        <div className="card"><p className="subtitle">Đang tải...</p></div>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="page">
      <div className="card profile-card">
        <div className="profile-header">
          <h1>Hồ sơ của bạn</h1>
          <Link href="/dashboard" className="link-muted">← Bảng điều khiển</Link>
        </div>
        <p className="subtitle">
          Cập nhật bất kỳ trường nào — gợi ý sẽ thay đổi theo.
        </p>
        {savedAt && <div className="alert alert-success">Đã lưu lúc {savedAt}</div>}
        <ProfileForm
          initial={toInput(profile)}
          submitLabel="Lưu thay đổi"
          submittingLabel="Đang lưu..."
          onSubmit={onSubmit}
        />
      </div>
    </main>
  );
}
