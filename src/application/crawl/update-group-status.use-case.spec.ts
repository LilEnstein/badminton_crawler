import { describe, expect, it, vi } from "vitest";

import { FacebookGroup, GroupNotFoundError, IllegalStatusTransitionError } from "@/domain/crawl";

import type { FacebookGroupRepository } from "./ports";
import { UpdateGroupStatusUseCase } from "./update-group-status.use-case";

const FIXED_NOW = new Date("2024-06-01T00:00:00Z");

function makeGroup(status: "active" | "paused" | "no_access") {
  return FacebookGroup.create({
    id: "01H",
    fbGroupId: "111",
    name: "Group",
    url: "https://facebook.com/groups/111",
    status,
    addedAt: FIXED_NOW
  });
}

function makeRepo(group: FacebookGroup | null): FacebookGroupRepository {
  return {
    findById: vi.fn().mockResolvedValue(group),
    findByFbGroupId: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue([]),
    findActive: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined)
  };
}

describe("UpdateGroupStatusUseCase", () => {
  it("updates active → paused", async () => {
    const repo = makeRepo(makeGroup("active"));
    const useCase = new UpdateGroupStatusUseCase({ repo });
    const result = await useCase.execute({ id: "01H", status: "paused" });
    expect(result.status).toBe("paused");
    expect(repo.save).toHaveBeenCalledOnce();
  });

  it("throws GroupNotFoundError when group missing", async () => {
    const repo = makeRepo(null);
    const useCase = new UpdateGroupStatusUseCase({ repo });
    await expect(useCase.execute({ id: "missing", status: "paused" })).rejects.toThrow(
      GroupNotFoundError
    );
  });

  it("throws IllegalStatusTransitionError on invalid transition", async () => {
    const repo = makeRepo(makeGroup("active"));
    const useCase = new UpdateGroupStatusUseCase({ repo });
    await expect(useCase.execute({ id: "01H", status: "active" })).rejects.toThrow(
      IllegalStatusTransitionError
    );
  });
});
