"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getStoredUser } from "@/app/lib/auth-client";

import { EmptyState } from "./_components/empty-state";
import { FilterChips } from "./_components/filter-chips";
import { SessionCard } from "./_components/session-card";
import type { FeedMeta, SessionListItem } from "./lib/feed-client";
import { fetchFeed } from "./lib/feed-client";

export default function FeedPage() {
  const router = useRouter();
  const [items, setItems] = useState<SessionListItem[]>([]);
  const [meta, setMeta] = useState<FeedMeta>({ total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlots, setActiveSlots] = useState<string[]>([]);
  const [includeAll, setIncludeAll] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async (params: { slots: string[]; all: boolean; p: number }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFeed({
        timeSlots: params.slots.length ? params.slots : undefined,
        status: params.all ? "all" : "open",
        page: params.p
      });
      setItems(result.items);
      setMeta(result.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getStoredUser()) { router.replace("/login"); return; }
    load({ slots: [], all: false, p: 1 });
  }, [router, load]);

  function toggleSlot(slot: string) {
    const next = activeSlots.includes(slot)
      ? activeSlots.filter((s) => s !== slot)
      : [...activeSlots, slot];
    setActiveSlots(next);
    setPage(1);
    load({ slots: next, all: includeAll, p: 1 });
  }

  function toggleAll() {
    const next = !includeAll;
    setIncludeAll(next);
    setPage(1);
    load({ slots: activeSlots, all: next, p: 1 });
  }

  function goPage(p: number) {
    setPage(p);
    load({ slots: activeSlots, all: includeAll, p });
  }

  const totalPages = Math.ceil(meta.total / meta.pageSize);

  return (
    <main className="feed-page">
      <div className="feed-container">
        <div className="feed-header">
          <div>
            <h1 className="feed-title">Lịch thi đấu</h1>
            <p className="feed-subtitle">Tìm buổi chơi cầu lông phù hợp với bạn</p>
          </div>
          <Link href="/dashboard" className="btn btn-secondary feed-back-btn">← Dashboard</Link>
        </div>

        <FilterChips
          activeSlots={activeSlots}
          onToggleSlot={toggleSlot}
          includeAll={includeAll}
          onToggleAll={toggleAll}
        />

        {error && <div className="alert">{error}</div>}

        {loading && <p className="feed-loading">Đang tải...</p>}

        {!loading && items.length === 0 && !error && <EmptyState />}

        {!loading && items.length > 0 && (
          <>
            <p className="feed-count">{meta.total} buổi chơi</p>
            <div className="feed-list">
              {items.map(({ session, matchScore }) => (
                <SessionCard key={session.id} session={session} matchScore={matchScore} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="feed-pagination">
                <button
                  className="btn btn-secondary feed-page-btn"
                  onClick={() => goPage(page - 1)}
                  disabled={page <= 1}
                >
                  ←
                </button>
                <span className="feed-page-info">{page} / {totalPages}</span>
                <button
                  className="btn btn-secondary feed-page-btn"
                  onClick={() => goPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
