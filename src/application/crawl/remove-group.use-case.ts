import { GroupNotFoundError } from "@/domain/crawl";

import type { FacebookGroupRepository } from "./ports";

export interface RemoveGroupDeps {
  repo: FacebookGroupRepository;
}

export class RemoveGroupUseCase {
  constructor(private readonly deps: RemoveGroupDeps) {}

  async execute(id: string): Promise<void> {
    const group = await this.deps.repo.findById(id);
    if (!group) throw new GroupNotFoundError();

    await this.deps.repo.delete(id);
  }
}
