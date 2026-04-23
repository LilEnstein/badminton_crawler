"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, postJson } from "@/app/lib/auth-client";

export interface TopBarUser {
  displayName: string;
  email: string;
  avatarUrl?: string;
  level: number | null;
  levelLabel?: string;
  city?: string;
  district?: string;
}

interface TopBarProps {
  user: TopBarUser;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TopBar({ user }: TopBarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const close = useCallback(() => {
    setIsOpen(false);
    setConfirmOpen(false);
  }, []);

  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState !== "visible") close();
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [close]);

  async function confirmLogout() {
    setLoggingOut(true);
    close();
    try {
      await postJson("/api/v1/auth/logout", {});
    } catch {}
    clearSession();
    router.replace("/login");
  }

  const displayName = user.displayName || user.email.split("@")[0];
  const initials = getInitials(displayName);
  const hasAvatar = !!user.avatarUrl && !avatarFailed;

  return (
    <>
      <header className="top-bar">
        <div className="top-bar-logo">
          <div className="top-bar-logo-icon">B</div>
          <span className="top-bar-app-name">BadmintonFinder</span>
        </div>

        <div className="top-bar-actions">
          <button className="top-bar-icon-btn" aria-label="Thông báo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <button
            className={`top-bar-avatar-btn${isOpen ? " top-bar-avatar-btn--active" : ""}`}
            onClick={() => setIsOpen((v) => !v)}
            aria-label={`Tài khoản của ${displayName}`}
            aria-expanded={isOpen}
            aria-haspopup="menu"
          >
            <div className="top-bar-avatar">
              {hasAvatar ? (
                <img src={user.avatarUrl} alt={displayName} onError={() => setAvatarFailed(true)} />
              ) : (
                <span className="top-bar-avatar-initials">{initials}</span>
              )}
            </div>
            {user.level != null && (
              <span className="top-bar-level-badge">Lv.{user.level}</span>
            )}
          </button>
        </div>
      </header>

      {isOpen && (
        <div className="top-bar-backdrop" onClick={close} aria-label="Đóng menu" role="button" tabIndex={-1} />
      )}

      <div className={`avatar-dropdown${isOpen ? " avatar-dropdown--open" : ""}`} role="menu" aria-label="Menu tài khoản">
        <DropdownHeader user={user} initials={initials} hasAvatar={hasAvatar} onAvatarError={() => setAvatarFailed(true)} />

        <div className="avatar-dropdown-divider" />
        <div className="avatar-dropdown-section">
          <Link href="/profile" className="avatar-dropdown-item avatar-dropdown-item--primary" role="menuitem" onClick={close}>
            <IconContainer variant="primary"><IconUserEdit /></IconContainer>
            <div className="avatar-dropdown-item-text">
              <span>Chỉnh sửa hồ sơ</span>
              <span className="avatar-dropdown-item-sub">Trình độ, khu vực, ngân sách</span>
            </div>
          </Link>
        </div>

        <div className="avatar-dropdown-divider" />
        <div className="avatar-dropdown-section">
          <button className="avatar-dropdown-item avatar-dropdown-item--secondary" role="menuitem" onClick={close}>
            <IconContainer variant="secondary"><IconSettings /></IconContainer>
            <span className="avatar-dropdown-item-label">Cài đặt</span>
          </button>
        </div>

        <div className="avatar-dropdown-divider" />
        <div className="avatar-dropdown-section">
          {!confirmOpen ? (
            <button
              className="avatar-dropdown-item avatar-dropdown-item--danger"
              role="menuitem"
              onClick={() => setConfirmOpen(true)}
            >
              <IconContainer variant="danger"><IconLogout /></IconContainer>
              <span className="avatar-dropdown-item-label">Đăng xuất</span>
            </button>
          ) : (
            <div className="avatar-dropdown-confirm">
              <p className="avatar-dropdown-confirm-text">Bạn sẽ cần đăng nhập lại để tiếp tục tìm sân.</p>
              <div className="avatar-dropdown-confirm-actions">
                <button className="avatar-dropdown-confirm-cancel" onClick={() => setConfirmOpen(false)}>Huỷ</button>
                <button className="avatar-dropdown-confirm-ok" onClick={confirmLogout} disabled={loggingOut}>
                  {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function DropdownHeader({ user, initials, hasAvatar, onAvatarError }: {
  user: TopBarUser;
  initials: string;
  hasAvatar: boolean;
  onAvatarError: () => void;
}) {
  const displayName = user.displayName || user.email.split("@")[0];
  return (
    <div className="avatar-dropdown-header">
      <div className="avatar-dropdown-header-avatar">
        {hasAvatar ? (
          <img src={user.avatarUrl} alt={displayName} onError={onAvatarError} />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div className="avatar-dropdown-header-info">
        <div className="avatar-dropdown-name">{displayName}</div>
        <div className="avatar-dropdown-email">{user.email}</div>
        <div className="avatar-dropdown-meta">
          {user.level != null ? (
            <span className="avatar-dropdown-level-pill">
              {user.levelLabel ? `${user.levelLabel} · ` : ""}Lv.{user.level}
            </span>
          ) : (
            <span className="avatar-dropdown-level-pill avatar-dropdown-level-pill--unknown">Chưa xác định</span>
          )}
          {user.city && (
            <span className="avatar-dropdown-location">
              {user.city}{user.district ? ` · ${user.district}` : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function IconContainer({ children, variant }: { children: React.ReactNode; variant: "primary" | "secondary" | "danger" }) {
  return <div className={`avatar-dropdown-item-icon avatar-dropdown-item-icon--${variant}`}>{children}</div>;
}

function IconUserEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
