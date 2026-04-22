import { describe, expect, it, vi } from "vitest";

import { DuplicateGroupError, GroupAccessError } from "@/domain/crawl";

import type { FacebookAccessTester, FacebookGroupRepository } from "./ports";
import { AddGroupUseCase } from "./add-group.use-case";

const FIXED_NOW = new Date("2024-06-01T00:00:00Z");

function makeRepo(overrides: Partial<FacebookGroupRepository> = {}): FacebookGroupRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByFbGroupId: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue([]),
    findActive: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides
  };
}

function makeTester(canAccess: boolean): FacebookAccessTester {
  return { canAccess: vi.fn().mockResolvedValue(canAccess) };
}

const clock = { now: () => FIXED_NOW };
const ids = { generate: () => "01HTEST" };

describe("AddGroupUseCase", () => {
  it("saves and returns a group when access succeeds", async () => {
    const repo = makeRepo();
    const useCase = new AddGroupUseCase({ repo, accessTester: makeTester(true), clock });

    const group = await useCase.execute({
      id: "01HTEST",
      fbGroupId: "111",
      name: "Test Group",
      url: "https://facebook.com/groups/111"
    });

    expect(group.status).toBe("active");
    expect(repo.save).toHaveBeenCalledOnce();
  });

  it("throws GroupAccessError and does not save when access fails", async () => {
    const repo = makeRepo();
    const useCase = new AddGroupUseCase({ repo, accessTester: makeTester(false), clock });

    await expect(
      useCase.execute({
        id: "01HTEST",
        fbGroupId: "111",
        name: "Test Group",
        url: "https://facebook.com/groups/111"
      })
    ).rejects.toThrow(GroupAccessError);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("throws DuplicateGroupError when fbGroupId already exists", async () => {
    const existing = {
      id: "existing",
      fbGroupId: "111",
      name: "Existing",
      url: "https://facebook.com/groups/111",
      status: "active" as const,
      addedAt: FIXED_NOW
    };
    const { FacebookGroup } = await import("@/domain/crawl");
    const repo = makeRepo({
      findByFbGroupId: vi.fn().mockResolvedValue(FacebookGroup.create(existing))
    });
    const useCase = new AddGroupUseCase({ repo, accessTester: makeTester(true), clock });

    await expect(
      useCase.execute({ id: "01HNEW", fbGroupId: "111", name: "New", url: "https://facebook.com/groups/111" })
    ).rejects.toThrow(DuplicateGroupError);
  });
});
