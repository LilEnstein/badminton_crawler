import type { FacebookGroupRepository } from "@/application/crawl/ports";
import { FacebookGroup, type GroupStatus } from "@/domain/crawl";

import type { BadmintonStore, FacebookGroupRecord } from "../db/json-store";

export class JsonFacebookGroupRepository implements FacebookGroupRepository {
  constructor(private readonly store: BadmintonStore) {}

  async findById(id: string): Promise<FacebookGroup | null> {
    const rows = await this.store.groups();
    const row = rows.find((g) => g.id === id);
    return row ? this.toEntity(row) : null;
  }

  async findByFbGroupId(fbGroupId: string): Promise<FacebookGroup | null> {
    const rows = await this.store.groups();
    const row = rows.find((g) => g.fbGroupId === fbGroupId);
    return row ? this.toEntity(row) : null;
  }

  async findAll(): Promise<FacebookGroup[]> {
    const rows = await this.store.groups();
    return rows.map((r) => this.toEntity(r));
  }

  async findActive(): Promise<FacebookGroup[]> {
    const rows = await this.store.groups();
    return rows.filter((r) => r.status === "active").map((r) => this.toEntity(r));
  }

  async save(group: FacebookGroup): Promise<void> {
    const record = this.toRecord(group);
    await this.store.mutate((s) => {
      const idx = s.groups.findIndex((g) => g.id === record.id);
      if (idx >= 0) s.groups[idx] = record;
      else s.groups.push(record);
    });
  }

  async delete(id: string): Promise<void> {
    await this.store.mutate((s) => {
      s.groups = s.groups.filter((g) => g.id !== id);
    });
  }

  private toRecord(group: FacebookGroup): FacebookGroupRecord {
    return {
      id: group.id,
      fbGroupId: group.fbGroupId,
      name: group.name,
      url: group.url,
      status: group.status,
      addedAt: group.addedAt.toISOString()
    };
  }

  private toEntity(row: FacebookGroupRecord): FacebookGroup {
    const status = this.parseStatus(row.status);
    return FacebookGroup.create({
      id: row.id,
      fbGroupId: row.fbGroupId,
      name: row.name,
      url: row.url,
      status,
      addedAt: new Date(row.addedAt)
    });
  }

  private parseStatus(value: string): GroupStatus {
    if (value === "active" || value === "paused" || value === "no_access") return value;
    return "no_access";
  }
}
