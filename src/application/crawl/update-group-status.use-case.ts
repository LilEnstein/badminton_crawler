import type { FacebookGroup, GroupStatus } from "@/domain/crawl";
import { GroupNotFoundError } from "@/domain/crawl";

import type { FacebookGroupRepository } from "./ports";

export interface UpdateGroupStatusInput {
  id: string;
  status: GroupStatus;
}

export interface UpdateGroupStatusDeps {
  repo: FacebookGroupRepository;
}

export class UpdateGroupStatusUseCase {
  constructor(private readonly deps: UpdateGroupStatusDeps) {}

  async execute(input: UpdateGroupStatusInput): Promise<FacebookGroup> {
    const group = await this.deps.repo.findById(input.id);
    if (!group) throw new GroupNotFoundError();

    group.transitionTo(input.status);
    await this.deps.repo.save(group);
    return group;
  }
}
