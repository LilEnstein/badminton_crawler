import type { Clock } from "@/application/auth/ports";
import { DuplicateGroupError, FacebookGroup, GroupAccessError } from "@/domain/crawl";

import type { FacebookAccessTester, FacebookGroupRepository } from "./ports";

export interface AddGroupInput {
  id: string;
  fbGroupId: string;
  name: string;
  url: string;
}

export interface AddGroupDeps {
  repo: FacebookGroupRepository;
  accessTester: FacebookAccessTester;
  clock: Clock;
}

export class AddGroupUseCase {
  constructor(private readonly deps: AddGroupDeps) {}

  async execute(input: AddGroupInput): Promise<FacebookGroup> {
    const existing = await this.deps.repo.findByFbGroupId(input.fbGroupId);
    if (existing) throw new DuplicateGroupError(input.fbGroupId);

    const canAccess = await this.deps.accessTester.canAccess(input.url);
    if (!canAccess) throw new GroupAccessError(input.url);

    const group = FacebookGroup.create({
      id: input.id,
      fbGroupId: input.fbGroupId,
      name: input.name,
      url: input.url,
      status: "active",
      addedAt: this.deps.clock.now()
    });

    await this.deps.repo.save(group);
    return group;
  }
}
